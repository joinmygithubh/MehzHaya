import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadImage.js";

// @desc    Get all products (search, filter, sort, paginate)
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const resultsPerPage = Number(req.query.limit) || 12;

  // count after filters (without pagination)
  const countFeatures = new ApiFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter();
  const filteredCount = await Product.countDocuments(countFeatures.query.getFilter());

  const features = new ApiFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter()
    .sort()
    .paginate(resultsPerPage);

  const products = await features.query.populate("category", "name slug group");

  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts: filteredCount,
    resultsPerPage,
    totalPages: Math.ceil(filteredCount / resultsPerPage),
    currentPage: Number(req.query.page) || 1,
    products,
  });
});

// @desc    Live search suggestions
// @route   GET /api/v1/products/suggestions?keyword=
// @access  Public
export const getSuggestions = asyncHandler(async (req, res) => {
  const { keyword } = req.query;
  if (!keyword || keyword.trim().length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }
  const suggestions = await Product.find({
    isActive: true,
    name: { $regex: keyword, $options: "i" },
  })
    .select("name slug images price discount")
    .limit(6);
  res.status(200).json({ success: true, suggestions });
});

// @desc    Get product groups with categories
// @route   GET /api/v1/products/sections/home
// @access  Public
export const getHomeSections = asyncHandler(async (req, res) => {
  const [featured, bestSellers, newArrivals, trending, flashSale] = await Promise.all([
    Product.find({ isActive: true, isFeatured: true }).limit(8).sort("-createdAt"),
    Product.find({ isActive: true }).sort("-sold").limit(8),
    Product.find({ isActive: true, isNewArrival: true }).limit(8).sort("-createdAt"),
    Product.find({ isActive: true, isTrending: true }).limit(8).sort("-views"),
    Product.find({ isActive: true, isFlashSale: true }).limit(8).sort("-discount"),
  ]);
  res.status(200).json({
    success: true,
    sections: { featured, bestSellers, newArrivals, trending, flashSale },
  });
});

// @desc    Get single product by slug or id
// @route   GET /api/v1/products/:idOrSlug
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const product = await Product.findOne(query).populate("category", "name slug group");
  if (!product) throw new ApiError(404, "Product not found");

  // increment views (non-blocking)
  Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).exec();

  // related products (same category, exclude self)
  const related = await Product.find({
    _id: { $ne: product._id },
    categoryName: product.categoryName,
    isActive: true,
  })
    .limit(4)
    .select("name slug price discount images ratings numReviews");

  res.status(200).json({ success: true, product, related });
});

/* ---------------- Admin ---------------- */

// @desc    Create product
// @route   POST /api/v1/products
// @access  Admin
export const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) throw new ApiError(400, "Invalid category");

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "mehzhaya/products"))
    );
  } else if (req.body.images) {
    // allow passing image URLs directly (JSON string or array)
    const urls = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    images = urls.map((url) => ({ public_id: "", url }));
  }

  if (images.length === 0) throw new ApiError(400, "Please provide at least one product image");

  const parseArr = (v) => (typeof v === "string" ? JSON.parse(v) : v) || [];

  const product = await Product.create({
    ...req.body,
    images,
    colors: parseArr(req.body.colors),
    sizes: parseArr(req.body.sizes),
    categoryName: category.name,
    group: category.group,
  });

  await Category.updateOne({ _id: category._id }, { $inc: { productCount: 1 } });

  res.status(201).json({ success: true, message: "Product created", product });
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const updates = { ...req.body };

  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) throw new ApiError(400, "Invalid category");
    updates.categoryName = category.name;
    updates.group = category.group;
  }

  ["colors", "sizes"].forEach((k) => {
    if (updates[k] && typeof updates[k] === "string") updates[k] = JSON.parse(updates[k]);
  });

  // append new uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "mehzhaya/products"))
    );
    updates.images = [...product.images, ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: "Product updated", product });
});

// @desc    Delete product image
// @route   DELETE /api/v1/products/:id/images/:publicId
// @access  Admin
export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  const publicId = decodeURIComponent(req.params.publicId);
  await deleteFromCloudinary(publicId);
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();
  res.status(200).json({ success: true, message: "Image removed", product });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  await Promise.all(
    product.images
      .filter((img) => img.public_id)
      .map((img) => deleteFromCloudinary(img.public_id))
  );
  await product.deleteOne();
  await Category.updateOne({ _id: product.category }, { $inc: { productCount: -1 } });

  res.status(200).json({ success: true, message: "Product deleted" });
});

// @desc    Get all products (admin - includes inactive)
// @route   GET /api/v1/products/admin/all
// @access  Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("-createdAt").populate("category", "name");
  res.status(200).json({ success: true, count: products.length, products });
});
