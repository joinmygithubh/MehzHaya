import asyncHandler from "express-async-handler";
import Banner from "../models/Banner.js";
import ApiError from "../utils/ApiError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadImage.js";

// @desc    Get active banners
// @route   GET /api/v1/banners
// @access  Public
export const getBanners = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.position) filter.position = req.query.position;
  const banners = await Banner.find(filter).sort("order");
  res.status(200).json({ success: true, banners });
});

// @desc    Get all banners (admin)
// @route   GET /api/v1/banners/admin/all
// @access  Admin
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort("position order");
  res.status(200).json({ success: true, banners });
});

// @desc    Create banner
// @route   POST /api/v1/banners
// @access  Admin
export const createBanner = asyncHandler(async (req, res) => {
  let image = req.body.image ? { public_id: "", url: req.body.image } : null;
  if (req.file) image = await uploadToCloudinary(req.file.buffer, "mehzhaya/banners");
  if (!image) throw new ApiError(400, "Please provide a banner image");

  const banner = await Banner.create({ ...req.body, image });
  res.status(201).json({ success: true, message: "Banner created", banner });
});

// @desc    Update banner
// @route   PUT /api/v1/banners/:id
// @access  Admin
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");
  Object.assign(banner, req.body);
  if (req.file) {
    if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
    banner.image = await uploadToCloudinary(req.file.buffer, "mehzhaya/banners");
  }
  await banner.save();
  res.status(200).json({ success: true, message: "Banner updated", banner });
});

// @desc    Delete banner
// @route   DELETE /api/v1/banners/:id
// @access  Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, "Banner not found");
  if (banner.image?.public_id) await deleteFromCloudinary(banner.image.public_id);
  await banner.deleteOne();
  res.status(200).json({ success: true, message: "Banner deleted" });
});
