import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
import ApiError from "../utils/ApiError.js";

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.status(200).json({ success: true, count: coupons.length, coupons });
});

// @desc    Create coupon
// @route   POST /api/v1/coupons
// @access  Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const exists = await Coupon.findOne({ code: req.body.code?.toUpperCase() });
  if (exists) throw new ApiError(400, "Coupon code already exists");
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: "Coupon created", coupon });
});

// @desc    Update coupon
// @route   PUT /api/v1/coupons/:id
// @access  Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.status(200).json({ success: true, message: "Coupon updated", coupon });
});

// @desc    Delete coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.status(200).json({ success: true, message: "Coupon deleted" });
});
