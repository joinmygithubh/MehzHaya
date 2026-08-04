import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadImage.js";

// @desc    Get all categories (optionally grouped)
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("group name");

  if (req.query.grouped === "true") {
    const grouped = categories.reduce((acc, cat) => {
      acc[cat.group] = acc[cat.group] || [];
      acc[cat.group].push(cat);
      return acc;
    }, {});
    return res.status(200).json({ success: true, grouped });
  }

  res.status(200).json({ success: true, count: categories.length, categories });
});

// @desc    Get category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, category });
});

/* ---------------- Admin ---------------- */

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, group, description } = req.body;
  let image = { public_id: "", url: "" };
  if (req.file) image = await uploadToCloudinary(req.file.buffer, "mehzhaya/categories");
  else if (req.body.image) image = { public_id: "", url: req.body.image };

  const category = await Category.create({ name, group, description, image });
  res.status(201).json({ success: true, message: "Category created", category });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const { name, group, description, isActive } = req.body;
  if (name) category.name = name;
  if (group) category.group = group;
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  if (req.file) {
    if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
    category.image = await uploadToCloudinary(req.file.buffer, "mehzhaya/categories");
  }
  await category.save();

  // keep denormalized names and groups in sync
  const updatePayload = {};
  if (name) updatePayload.categoryName = name;
  if (group) updatePayload.group = group;
  if (Object.keys(updatePayload).length > 0) {
    await Product.updateMany({ category: category._id }, updatePayload);
  }

  res.status(200).json({ success: true, message: "Category updated", category });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const count = await Product.countDocuments({ category: category._id });
  if (count > 0) {
    throw new ApiError(400, `Cannot delete: ${count} products use this category`);
  }
  if (category.image?.public_id) await deleteFromCloudinary(category.image.public_id);
  await category.deleteOne();
  res.status(200).json({ success: true, message: "Category deleted" });
});
