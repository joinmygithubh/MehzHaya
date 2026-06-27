import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadImage.js";

// @desc    Update profile (name, phone)
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "Profile updated", user });
});

// @desc    Update avatar
// @route   PUT /api/v1/users/avatar
// @access  Private
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an image");
  const user = await User.findById(req.user._id);

  if (user.avatar?.public_id) await deleteFromCloudinary(user.avatar.public_id);
  const result = await uploadToCloudinary(req.file.buffer, "mehzhaya/avatars");
  user.avatar = result;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Avatar updated", user });
});

/* ---------------- Address Book ---------------- */

// @desc    Get all addresses
// @route   GET /api/v1/users/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, addresses: user.addresses });
});

// @desc    Add address
// @route   POST /api/v1/users/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const isFirst = user.addresses.length === 0;
  const newAddress = { ...req.body, isDefault: req.body.isDefault || isFirst };

  if (newAddress.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(newAddress);
  await user.save({ validateBeforeSave: false });
  res.status(201).json({ success: true, message: "Address added", addresses: user.addresses });
});

// @desc    Update address
// @route   PUT /api/v1/users/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);
  if (!address) throw new ApiError(404, "Address not found");

  Object.assign(address, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => {
      if (a._id.toString() !== req.params.id) a.isDefault = false;
    });
  }
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "Address updated", addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/v1/users/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);
  if (!address) throw new ApiError(404, "Address not found");
  address.deleteOne();
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "Address removed", addresses: user.addresses });
});

/* ---------------- Admin ---------------- */

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({ success: true, user });
});

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) throw new ApiError(400, "Invalid role");
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({ success: true, message: "Role updated", user });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.avatar?.public_id) await deleteFromCloudinary(user.avatar.public_id);
  await user.deleteOne();
  res.status(200).json({ success: true, message: "User deleted" });
});
