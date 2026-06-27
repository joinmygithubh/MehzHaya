import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

// @desc    Create / update a review
// @route   POST /api/v1/reviews/:productId
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;
  if (!rating || !comment) throw new ApiError(400, "Please provide rating and comment");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // optional: ensure the user purchased the product
  const hasPurchased = await Order.exists({
    user: req.user._id,
    "items.product": productId,
  });

  // update embedded review or push new
  const existing = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (existing) {
    existing.rating = Number(rating);
    existing.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
  }
  product.calculateRatings();
  await product.save();

  // mirror into standalone Review collection
  await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    {
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: existing ? "Review updated" : "Review added",
    verified: Boolean(hasPurchased),
    ratings: product.ratings,
    numReviews: product.numReviews,
    reviews: product.reviews,
  });
});

// @desc    Get product reviews
// @route   GET /api/v1/reviews/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select("reviews ratings numReviews");
  if (!product) throw new ApiError(404, "Product not found");
  res.status(200).json({
    success: true,
    ratings: product.ratings,
    numReviews: product.numReviews,
    reviews: product.reviews.sort((a, b) => b.createdAt - a.createdAt),
  });
});

// @desc    Delete own review
// @route   DELETE /api/v1/reviews/:productId
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const isAdmin = req.user.role === "admin";
  const targetUser = req.query.userId && isAdmin ? req.query.userId : req.user._id.toString();

  product.reviews = product.reviews.filter((r) => r.user.toString() !== targetUser);
  product.calculateRatings();
  await product.save();
  await Review.deleteOne({ product: productId, user: targetUser });

  res.status(200).json({
    success: true,
    message: "Review deleted",
    ratings: product.ratings,
    numReviews: product.numReviews,
  });
});

// @desc    Get all reviews (admin moderation)
// @route   GET /api/v1/reviews
// @access  Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .sort("-createdAt")
    .populate("product", "name slug images")
    .populate("user", "name email");
  res.status(200).json({ success: true, count: reviews.length, reviews });
});
