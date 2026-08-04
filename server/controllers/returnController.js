import asyncHandler from "express-async-handler";
import Return from "../models/Return.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/uploadImage.js";
import { sendWhatsAppReturnUpdate } from "../utils/whatsappService.js";

// @desc    Request a return
// @route   POST /api/v1/returns
// @access  Private
export const createReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, reason, comments, items } = req.body;
  const order = await Order.findById(orderId);

  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to return this order");
  }
  if (order.orderStatus !== "Delivered") {
    throw new ApiError(400, "Only delivered orders can be returned");
  }

  // Check if return request already exists
  if (order.isReturnRequested) {
    throw new ApiError(400, "Return request already submitted for this order");
  }

  const existing = await Return.findOne({ order: orderId });
  if (existing) {
    order.isReturnRequested = true;
    order.returnStatus = existing.status || "Requested";
    order.returnRequestId = existing._id;
    await order.save();
    throw new ApiError(400, "Return request already submitted for this order");
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "mehzhaya/returns"))
    );
  } else if (req.body.images) {
    const urls = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    images = urls.map((url) => ({ public_id: "", url }));
  }

  if (!images || images.length === 0) {
    throw new ApiError(400, "Return images are required. Please upload at least one image for return verification.");
  }

  const parsedItems = typeof items === "string" ? JSON.parse(items) : items || [];
  const returnReq = await Return.create({
    order: orderId,
    user: req.user._id,
    items: parsedItems.length > 0 ? parsedItems : order.orderItems,
    reason,
    comments,
    images,
    status: "Requested",
    refundAmount: order.totalPrice,
  });

  // Update Order return status
  order.isReturnRequested = true;
  order.returnStatus = "Requested";
  order.returnRequestId = returnReq._id;
  await order.save();

  // Trigger WhatsApp Notification (non-blocking)
  sendWhatsAppReturnUpdate(returnReq, req.user).catch((e) => console.warn("WhatsApp notification warning:", e.message));

  res.status(201).json({ success: true, message: "Return request submitted", returnRequest: returnReq });
});

// @desc    Get user's return requests
// @route   GET /api/v1/returns/my-returns
// @access  Private
export const getMyReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ user: req.user._id })
    .populate("order", "orderId totalPrice orderStatus")
    .sort("-createdAt");
  res.status(200).json({ success: true, count: returns.length, returns });
});

// @desc    Get return details
// @route   GET /api/v1/returns/:id
// @access  Private
export const getReturnById = asyncHandler(async (req, res) => {
  const returnReq = await Return.findById(req.params.id)
    .populate("order", "orderId totalPrice orderStatus items shippingAddress")
    .populate("user", "name email phone");

  if (!returnReq) throw new ApiError(404, "Return request not found");
  if (req.user.role !== "admin" && returnReq.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  res.status(200).json({ success: true, returnRequest: returnReq });
});

// @desc    Get all return requests (Admin)
// @route   GET /api/v1/returns/admin/all
// @access  Admin
export const getAllReturnsAdmin = asyncHandler(async (req, res) => {
  const returns = await Return.find()
    .populate("user", "name email phone")
    .populate("order", "orderId totalPrice orderStatus items shippingAddress")
    .sort("-createdAt");

  res.status(200).json({ success: true, count: returns.length, returns });
});

// @desc    Cancel return request (Customer/Admin)
// @route   PUT /api/v1/returns/:id/cancel
// @access  Private
export const cancelReturnRequest = asyncHandler(async (req, res) => {
  const returnReq = await Return.findById(req.params.id).populate("user", "name email phone");
  if (!returnReq) throw new ApiError(404, "Return request not found");

  if (req.user.role !== "admin" && returnReq.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this return request");
  }

  if (returnReq.status === "Cancelled") {
    throw new ApiError(400, "Return request is already cancelled");
  }

  if (["Approved", "Received", "Refunded", "Completed"].includes(returnReq.status)) {
    throw new ApiError(400, "Return request cannot be cancelled once approved or processed");
  }

  returnReq.status = "Cancelled";
  returnReq.cancelledAt = new Date();
  returnReq.cancelledBy = req.user.role === "admin" ? "ADMIN" : "CUSTOMER";
  returnReq.cancellationReason = req.body.reason || "Cancelled by customer";
  await returnReq.save();

  // Sync parent order document
  if (returnReq.order) {
    await Order.updateOne(
      { _id: returnReq.order },
      { returnStatus: "Cancelled", isReturnRequested: false }
    );
  }

  // Trigger WhatsApp notification (non-blocking)
  sendWhatsAppReturnUpdate(returnReq, returnReq.user).catch((e) => console.warn("WhatsApp notification warning:", e.message));

  res.status(200).json({ success: true, message: "Return request cancelled successfully", returnRequest: returnReq });
});

// @desc    Update return status (Admin)
// @route   PUT /api/v1/returns/admin/:id
// @access  Admin
export const updateReturnStatusAdmin = asyncHandler(async (req, res) => {
  const { status, adminNotes, refundAmount } = req.body;
  const returnReq = await Return.findById(req.params.id).populate("user", "name email phone");

  if (!returnReq) throw new ApiError(404, "Return request not found");

  if (returnReq.status === "Cancelled" && status !== "Cancelled") {
    throw new ApiError(400, "Cannot approve or modify a cancelled return request");
  }

  if (status) returnReq.status = status;
  if (adminNotes !== undefined) returnReq.adminNotes = adminNotes;
  if (refundAmount !== undefined) returnReq.refundAmount = refundAmount;

  await returnReq.save();

  // Sync status to parent Order document
  if (status && returnReq.order) {
    const isReq = status !== "Cancelled" && status !== "Rejected";
    await Order.updateOne({ _id: returnReq.order }, { returnStatus: status, isReturnRequested: isReq });
  }

  // Trigger WhatsApp update
  sendWhatsAppReturnUpdate(returnReq, returnReq.user).catch((e) => console.warn("WhatsApp notification warning:", e.message));

  res.status(200).json({ success: true, message: "Return request updated", returnRequest: returnReq });
});
