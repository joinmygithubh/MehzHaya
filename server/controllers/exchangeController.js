import asyncHandler from "express-async-handler";
import Exchange from "../models/Exchange.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { sendWhatsAppOrderNotification } from "../utils/whatsappService.js";

// @desc    Request a size exchange
// @route   POST /api/v1/exchanges
// @access  Private
export const createExchangeRequest = asyncHandler(async (req, res) => {
  const { orderId, productId, currentSize, requestedSize, reason, comments } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to request exchange for this order");
  }

  if (order.orderStatus !== "Delivered") {
    throw new ApiError(400, "Only delivered orders are eligible for size exchange");
  }

  if (order.isExchangeRequested) {
    throw new ApiError(400, "An exchange request has already been submitted for this order");
  }

  if (order.isReturnRequested) {
    throw new ApiError(400, "A return request is already active for this order. Cannot request exchange.");
  }

  const existing = await Exchange.findOne({
    order: orderId,
    status: { $nin: ["EXCHANGE_CANCELLED", "EXCHANGE_REJECTED"] },
  });
  if (existing) {
    throw new ApiError(400, "An active exchange request already exists for this order");
  }

  const product = await Product.findById(productId || order.items[0]?.product);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.sizes && product.sizes.length > 0 && !product.sizes.includes(requestedSize)) {
    throw new ApiError(400, `Requested size (${requestedSize}) is not available for this product`);
  }

  if (product.stock <= 0) {
    throw new ApiError(400, `Requested size (${requestedSize}) is currently out of stock`);
  }

  const targetItem = order.items.find(
    (i) => i.product.toString() === (productId || product._id).toString()
  ) || order.items[0];

  const exchangeReq = await Exchange.create({
    order: orderId,
    user: req.user._id,
    product: product._id,
    productName: targetItem.name,
    productImage: targetItem.image,
    currentSize: currentSize || targetItem.size || "M",
    requestedSize,
    reason: reason || "Size issue",
    comments: comments || "",
    status: "EXCHANGE_REQUESTED",
  });

  // Update order status
  order.isExchangeRequested = true;
  order.exchangeStatus = "EXCHANGE_REQUESTED";
  order.exchangeRequestId = exchangeReq._id;
  await order.save();

  // Send notification
  sendWhatsAppOrderNotification(order, `Size exchange request received for size ${requestedSize}`).catch(
    (e) => console.warn("WhatsApp notification warning:", e.message)
  );

  res.status(201).json({
    success: true,
    message: "Size exchange request submitted successfully",
    exchangeRequest: exchangeReq,
  });
});

// @desc    Get user's exchange requests
// @route   GET /api/v1/exchanges/my-exchanges
// @access  Private
export const getMyExchanges = asyncHandler(async (req, res) => {
  const exchanges = await Exchange.find({ user: req.user._id })
    .populate("order", "orderId totalPrice orderStatus")
    .sort("-createdAt");
  res.status(200).json({ success: true, count: exchanges.length, exchanges });
});

// @desc    Get single exchange details
// @route   GET /api/v1/exchanges/:id
// @access  Private
export const getExchangeById = asyncHandler(async (req, res) => {
  const exchangeReq = await Exchange.findById(req.params.id)
    .populate("order", "orderId totalPrice orderStatus items shippingAddress")
    .populate("user", "name email phone");

  if (!exchangeReq) throw new ApiError(404, "Exchange request not found");

  if (req.user.role !== "admin" && exchangeReq.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view this exchange request");
  }

  res.status(200).json({ success: true, exchangeRequest: exchangeReq });
});

// @desc    Cancel exchange request (Customer/Admin)
// @route   PUT /api/v1/exchanges/:id/cancel
// @access  Private
export const cancelExchangeRequest = asyncHandler(async (req, res) => {
  const exchangeReq = await Exchange.findById(req.params.id);
  if (!exchangeReq) throw new ApiError(404, "Exchange request not found");

  if (req.user.role !== "admin" && exchangeReq.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this exchange request");
  }

  if (exchangeReq.status === "EXCHANGE_CANCELLED") {
    throw new ApiError(400, "Exchange request is already cancelled");
  }

  if (["NEW_PRODUCT_SHIPPED", "EXCHANGE_COMPLETED"].includes(exchangeReq.status)) {
    throw new ApiError(400, "Exchange request cannot be cancelled after item replacement has been shipped");
  }

  exchangeReq.status = "EXCHANGE_CANCELLED";
  exchangeReq.cancelledAt = new Date();
  exchangeReq.cancelledBy = req.user.role === "admin" ? "ADMIN" : "CUSTOMER";
  exchangeReq.cancellationReason = req.body.reason || "Cancelled by customer";
  await exchangeReq.save();

  if (exchangeReq.order) {
    await Order.updateOne(
      { _id: exchangeReq.order },
      { exchangeStatus: "EXCHANGE_CANCELLED", isExchangeRequested: false }
    );
  }

  res.status(200).json({ success: true, message: "Exchange request cancelled successfully", exchangeRequest: exchangeReq });
});

// @desc    Get all exchange requests (Admin)
// @route   GET /api/v1/exchanges/admin/all
// @access  Admin
export const getAllExchangesAdmin = asyncHandler(async (req, res) => {
  const exchanges = await Exchange.find()
    .populate("user", "name email phone")
    .populate("order", "orderId totalPrice orderStatus items shippingAddress")
    .sort("-createdAt");

  res.status(200).json({ success: true, count: exchanges.length, exchanges });
});

// @desc    Update exchange status (Admin)
// @route   PUT /api/v1/exchanges/admin/:id
// @access  Admin
export const updateExchangeStatusAdmin = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  const exchangeReq = await Exchange.findById(req.params.id);

  if (!exchangeReq) throw new ApiError(404, "Exchange request not found");

  if (exchangeReq.status === "EXCHANGE_CANCELLED") {
    throw new ApiError(400, "Cannot modify a cancelled exchange request");
  }

  if (status) exchangeReq.status = status;
  if (adminNotes !== undefined) exchangeReq.adminNotes = adminNotes;

  await exchangeReq.save();

  if (status && exchangeReq.order) {
    const isReq = status !== "EXCHANGE_CANCELLED" && status !== "EXCHANGE_REJECTED";
    await Order.updateOne({ _id: exchangeReq.order }, { exchangeStatus: status, isExchangeRequested: isReq });
  }

  res.status(200).json({ success: true, message: "Exchange request updated", exchangeRequest: exchangeReq });
});
