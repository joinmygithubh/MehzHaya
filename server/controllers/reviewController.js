import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/uploadImage.js";

// @desc    Create / update a verified purchase review
// @route   POST /api/v1/reviews/:productId
// @access  Private (Customer with Delivered Order)
export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { orderId, rating, title, comment } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required to submit a verified purchase review");
  }
  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, "Please select a rating between 1 and 5 stars");
  }

  // 1. Verify order exists, belongs to user, and is Delivered
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only review products from your own orders");
  }
  if (order.orderStatus !== "Delivered") {
    throw new ApiError(400, "Reviews are only allowed after your order has been Delivered");
  }

  // 2. Verify product is in order
  const orderItem = order.items.find(
    (item) => (item.product?._id || item.product)?.toString() === productId
  );
  if (!orderItem) {
    throw new ApiError(400, "This product was not found in your order");
  }

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // 3. Process optional image uploads
  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const result = await uploadToCloudinary(file.buffer, "mehzhaya/reviews");
        uploadedImages.push(result);
      } catch (err) {
        console.error("Review image upload error:", err.message);
      }
    }
  }

  // 4. Upsert Standalone Review Collection document
  const existingReview = await Review.findOne({
    order: orderId,
    product: productId,
    user: req.user._id,
  });

  let reviewDoc;
  if (existingReview) {
    existingReview.rating = Number(rating);
    existingReview.title = title || "";
    existingReview.comment = comment || "";
    if (uploadedImages.length > 0) {
      existingReview.images = uploadedImages;
    }
    existingReview.isVerifiedPurchase = true;
    existingReview.status = "Approved";
    reviewDoc = await existingReview.save();
  } else {
    reviewDoc = await Review.create({
      product: productId,
      order: orderId,
      orderItem: orderItem._id?.toString() || "",
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      title: title || "",
      comment: comment || "",
      images: uploadedImages,
      isVerifiedPurchase: true,
      status: "Approved",
    });
  }

  // 5. Update embedded reviews array in Product document
  const existingSubIndex = product.reviews.findIndex(
    (r) => r.user.toString() === req.user._id.toString() && r.order?.toString() === orderId
  );

  const subDoc = {
    user: req.user._id,
    order: orderId,
    name: req.user.name,
    rating: Number(rating),
    title: title || "",
    comment: comment || "",
    images: uploadedImages.length > 0 ? uploadedImages : (existingSubIndex >= 0 ? product.reviews[existingSubIndex].images : []),
    isVerifiedPurchase: true,
    status: "Approved",
  };

  if (existingSubIndex >= 0) {
    product.reviews[existingSubIndex] = subDoc;
  } else {
    product.reviews.push(subDoc);
  }

  product.calculateRatings();
  await product.save();

  res.status(201).json({
    success: true,
    message: existingReview ? "Review updated successfully" : "Review submitted successfully",
    review: reviewDoc,
    ratings: product.ratings,
    numReviews: product.numReviews,
  });
});

// @desc    Get customer's own reviews
// @route   GET /api/v1/reviews/my
// @access  Private
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "name slug images price")
    .sort("-createdAt");
  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    Get product reviews with breakdown stats
// @route   GET /api/v1/reviews/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select("reviews ratings numReviews");
  if (!product) throw new ApiError(404, "Product not found");

  const approvedReviews = (product.reviews || []).filter((r) => r.status !== "Hidden");

  // Calculate rating breakdown distribution
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  approvedReviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    breakdown[star] = (breakdown[star] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    ratings: product.ratings,
    numReviews: approvedReviews.length,
    breakdown,
    reviews: approvedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  });
});

// @desc    Delete own or admin review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  const isAdmin = req.user.role === "admin";
  if (!isAdmin && review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this review");
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  // Sync product embedded reviews
  const product = await Product.findById(productId);
  if (product) {
    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== id && !(r.user.toString() === review.user.toString() && r.order?.toString() === review.order?.toString())
    );
    product.calculateRatings();
    await product.save();
  }

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Get all reviews for Admin moderation
// @route   GET /api/v1/reviews/admin/all
// @access  Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const { rating, status, search } = req.query;
  const query = {};

  if (rating) query.rating = Number(rating);
  if (status) query.status = status;

  let reviews = await Review.find(query)
    .sort("-createdAt")
    .populate("product", "name slug images price")
    .populate("user", "name email");

  if (search?.trim()) {
    const term = search.trim().toLowerCase();
    reviews = reviews.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.title?.toLowerCase().includes(term) ||
        r.comment?.toLowerCase().includes(term) ||
        r.product?.name?.toLowerCase().includes(term)
    );
  }

  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    Update review status (Approve / Hide)
// @route   PATCH /api/v1/reviews/admin/:id/status
// @access  Admin
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Hidden", "Pending"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");

  review.status = status;
  await review.save();

  // Sync product embedded review status & recalculate rating
  const product = await Product.findById(review.product);
  if (product) {
    const subReview = product.reviews.find(
      (r) => r.user.toString() === review.user.toString() && r.order?.toString() === review.order?.toString()
    );
    if (subReview) {
      subReview.status = status;
    }
    product.calculateRatings();
    await product.save();
  }

  res.status(200).json({
    success: true,
    message: `Review status updated to ${status}`,
    review,
  });
});
