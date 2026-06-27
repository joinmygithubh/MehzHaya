import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../utils/emailTemplates.js";
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from "./cartController.js";

const genOrderId = () =>
  "MH-" +
  Date.now().toString(36).toUpperCase() +
  "-" +
  crypto.randomBytes(2).toString("hex").toUpperCase();

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, paymentInfo } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty");

  // verify stock & build items
  const items = [];
  let itemsPrice = 0;
  for (const ci of cart.items) {
    const product = await Product.findById(ci.product);
    if (!product) throw new ApiError(404, `Product ${ci.name} no longer exists`);
    if (product.stock < ci.quantity)
      throw new ApiError(400, `${product.name} has only ${product.stock} left in stock`);
    items.push({
      product: product._id,
      name: product.name,
      image: ci.image || product.images[0]?.url,
      price: ci.price,
      color: ci.color,
      size: ci.size,
      quantity: ci.quantity,
    });
    itemsPrice += ci.price * ci.quantity;
  }

  const discountPrice = cart.coupon?.discount || 0;
  const shippingPrice = itemsPrice > SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalPrice = Math.max(0, itemsPrice - discountPrice) + shippingPrice;

  const order = await Order.create({
    orderId: genOrderId(),
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    paymentInfo: {
      id: paymentInfo?.razorpay_payment_id || "",
      orderId: paymentInfo?.razorpay_order_id || "",
      signature: paymentInfo?.razorpay_signature || "",
      status: paymentMethod === "Razorpay" ? "Paid" : "Pending",
    },
    itemsPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    couponCode: cart.coupon?.code || "",
    paidAt: paymentMethod === "Razorpay" ? Date.now() : undefined,
    statusHistory: [{ status: "Pending", note: "Order placed" }],
  });

  // decrement stock & increment sold
  await Promise.all(
    items.map((i) =>
      Product.updateOne(
        { _id: i.product },
        { $inc: { stock: -i.quantity, sold: i.quantity } }
      )
    )
  );

  // increment coupon usage
  if (cart.coupon?.code) {
    await Coupon.updateOne({ code: cart.coupon.code }, { $inc: { usedCount: 1 } });
  }

  // clear cart
  cart.items = [];
  cart.coupon = { code: "", discount: 0 };
  await cart.save();

  // confirmation email (non-blocking)
  sendEmail({
    to: req.user.email,
    subject: `MehzHaya Order Confirmation - ${order.orderId}`,
    html: orderConfirmationTemplate(req.user.name, order),
  }).catch((e) => console.error("Order email failed:", e.message));

  res.status(201).json({ success: true, message: "Order placed successfully", order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  // only owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this order");
  }
  res.status(200).json({ success: true, order });
});

// @desc    Cancel order (user)
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized");
  if (["Shipped", "Out for Delivery", "Delivered"].includes(order.orderStatus))
    throw new ApiError(400, "Order can no longer be cancelled");
  if (order.orderStatus === "Cancelled") throw new ApiError(400, "Order is already cancelled");

  order.orderStatus = "Cancelled";
  order.statusHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
  await order.save();

  // restock
  await Promise.all(
    order.items.map((i) =>
      Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity, sold: -i.quantity } })
    )
  );

  res.status(200).json({ success: true, message: "Order cancelled", order });
});

/* ---------------- Admin ---------------- */

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  const orders = await Order.find(filter).sort("-createdAt").populate("user", "name email");
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  res.status(200).json({ success: true, count: orders.length, totalRevenue, orders });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  if (status === "Delivered") {
    order.deliveredAt = Date.now();
    if (order.paymentMethod === "COD") order.paymentInfo.status = "Paid";
  }
  await order.save();
  res.status(200).json({ success: true, message: "Order status updated", order });
});
