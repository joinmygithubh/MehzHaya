import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Razorpay from "razorpay";
import ApiError from "../utils/ApiError.js";


let instance = null;
const getRazorpay = () => {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

// @desc    Get Razorpay public key
// @route   GET /api/v1/payment/key
// @access  Private
export const getRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// @desc    Create a Razorpay order
// @route   POST /api/v1/payment/order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body; // amount in INR (rupees)
  if (!amount || amount <= 0) throw new ApiError(400, "Invalid amount");

  const options = {
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: "rcpt_" + Date.now(),
  };
  const order = await getRazorpay().orders.create(options);
  res.status(200).json({ success: true, order });
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/v1/payment/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed. Invalid signature.");
  }

  res.status(200).json({
    success: true,
    message: "Payment verified",
    paymentInfo: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
  });
});
