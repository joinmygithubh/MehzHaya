import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import ApiError from "../utils/ApiError.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationTemplate, ownerOrderNotificationTemplate } from "../utils/emailTemplates.js";
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from "./cartController.js";
import { sendOrderConfirmationWhatsApp, sendOrderStatusWhatsApp } from "../utils/whatsappService.js";

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

  // confirmation emails & whatsapp (non-blocking)
  const ownerEmail = (process.env.OWNER_EMAIL || "mehzhaya@gmail.com").trim();
  const customerEmail = req.user.email;

  const dispatchOrderEmails = async () => {
    let emailTriggered = false;
    let smtpStatus = "Pending";
    let emailSent = false;

    console.log("[ORDER EMAIL]");
    console.log(`Order ID: ${order.orderId}`);
    console.log(`Customer email: ${customerEmail}`);
    console.log(`Owner email: ${ownerEmail}`);

    try {
      emailTriggered = true;
      console.log(`Email function triggered: ${emailTriggered}`);

      // Send owner notification email
      const ownerRes = await sendEmail({
        to: ownerEmail,
        subject: `🚨 New Order Alert - ${order.orderId} (₹${order.totalPrice})`,
        html: ownerOrderNotificationTemplate(req.user, order),
      });

      // Send customer confirmation email
      const customerRes = await sendEmail({
        to: customerEmail,
        subject: `MehzHaya Order Confirmation - ${order.orderId}`,
        html: orderConfirmationTemplate(req.user.name, order),
      });

      smtpStatus = "Connected & Verified";
      emailSent = true;
      console.log(`SMTP connection status: ${smtpStatus}`);
      console.log(`Email sent successfully: ${emailSent}`);
      console.log(`[ORDER EMAIL SUCCESS] Owner MsgID: ${ownerRes.messageId}, Customer MsgID: ${customerRes.messageId}`);
    } catch (err) {
      console.error(`[ORDER EMAIL ERROR] Failed to send order emails:`, err.message);
      console.log(`SMTP connection status: Connection Error (${err.message})`);
      console.log(`Email sent successfully: false`);
    }
  };

  dispatchOrderEmails();

  sendOrderConfirmationWhatsApp(order, req.user).catch((e) => console.warn("WhatsApp notification warning:", e.message));

  res.status(201).json({ success: true, message: "Order placed successfully", order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/v1/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order with customer's item reviews
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  // only owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this order");
  }

  // Fetch logged-in customer's reviews for this order
  const userReviews = await Review.find({
    order: order._id,
    user: req.user._id,
  });

  const orderObj = order.toObject();
  orderObj.items = orderObj.items.map((item) => {
    const pId = (item.product?._id || item.product)?.toString();
    const rev = userReviews.find((r) => r.product?.toString() === pId);

    return {
      ...item,
      review: rev
        ? {
            _id: rev._id,
            rating: rev.rating,
            title: rev.title,
            comment: rev.comment,
            images: rev.images,
            createdAt: rev.createdAt,
          }
        : null,
    };
  });

  res.status(200).json({ success: true, order: orderObj });
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
  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) throw new ApiError(404, "Order not found");

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  if (status === "Delivered") {
    order.deliveredAt = Date.now();
    if (order.paymentMethod === "COD") order.paymentInfo.status = "Paid";
  }
  await order.save();

  sendOrderStatusWhatsApp(order, order.user).catch((e) => console.warn("WhatsApp notification warning:", e.message));

  res.status(200).json({ success: true, message: "Order status updated", order });
});
