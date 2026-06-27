import asyncHandler from "express-async-handler";
import Wishlist from "../models/Wishlist.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

const getOrCreate = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

// @desc    Get wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products",
    "name slug price discount images ratings numReviews stock"
  );
  res.status(200).json({ success: true, products: wishlist?.products || [] });
});

// @desc    Toggle product in wishlist
// @route   POST /api/v1/wishlist/:productId
// @access  Private
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const wishlist = await getOrCreate(req.user._id);
  const index = wishlist.products.findIndex((p) => p.toString() === productId);

  let message;
  if (index > -1) {
    wishlist.products.splice(index, 1);
    message = "Removed from wishlist";
  } else {
    wishlist.products.push(productId);
    message = "Added to wishlist";
  }
  await wishlist.save();
  res.status(200).json({ success: true, message, productIds: wishlist.products });
});

// @desc    Remove from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );
  await wishlist.save();
  res.status(200).json({ success: true, message: "Removed from wishlist", productIds: wishlist.products });
});

// @desc    Move wishlist item to cart
// @route   POST /api/v1/wishlist/:productId/move-to-cart
// @access  Private
export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < 1) throw new ApiError(400, "Product is out of stock");

  // remove from wishlist
  const wishlist = await getOrCreate(req.user._id);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();

  // add to cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const existing = cart.items.find((i) => i.product.toString() === productId && !i.color && !i.size);
  if (existing) existing.quantity += 1;
  else
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price: product.finalPrice,
      quantity: 1,
    });
  await cart.save();

  res.status(200).json({ success: true, message: "Moved to cart", productIds: wishlist.products });
});
