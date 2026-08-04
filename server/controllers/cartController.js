import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import ApiError from "../utils/ApiError.js";

const SHIPPING_THRESHOLD = 999; // free shipping above this
const SHIPPING_FEE = 49;

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const buildSummary = (cart) => {
  const itemsPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = cart.coupon?.discount || 0;
  const shippingPrice = itemsPrice > SHIPPING_THRESHOLD || itemsPrice === 0 ? 0 : SHIPPING_FEE;
  const totalPrice = Math.max(0, itemsPrice - discount) + shippingPrice;
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  return { itemsPrice, discount, shippingPrice, totalPrice, totalItems };
};

// @desc    Get cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ success: true, cart, summary: buildSummary(cart) });
});

// @desc    Add to cart
// @route   POST /api/v1/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color = "", size = "" } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Not enough stock available");

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find(
    (i) => i.product.toString() === productId && i.color === color && i.size === size
  );

  if (existing) {
    existing.quantity += Number(quantity);
    if (existing.quantity > product.stock)
      throw new ApiError(400, "Quantity exceeds available stock");
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price: product.finalPrice,
      color,
      size,
      quantity: Number(quantity),
    });
  }
  await cart.save();
  res.status(200).json({ success: true, message: "Added to cart", cart, summary: buildSummary(cart) });
});

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found");

  if (quantity < 1) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    if (product && quantity > product.stock)
      throw new ApiError(400, "Quantity exceeds available stock");
    item.quantity = quantity;
  }
  await cart.save();
  res.status(200).json({ success: true, cart, summary: buildSummary(cart) });
});

// @desc    Remove cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, "Cart item not found");
  item.deleteOne();
  await cart.save();
  res.status(200).json({ success: true, message: "Item removed", cart, summary: buildSummary(cart) });
});

// @desc    Clear cart
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = { code: "", discount: 0 };
  await cart.save();
  res.status(200).json({ success: true, message: "Cart cleared", cart, summary: buildSummary(cart) });
});

// @desc    Apply coupon
// @route   POST /api/v1/cart/coupon
// @access  Private
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const itemsPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) throw new ApiError(404, "Invalid coupon code");

  const validity = coupon.isValid(itemsPrice);
  if (!validity.valid) throw new ApiError(400, validity.reason);

  const discount = coupon.computeDiscount(itemsPrice);
  cart.coupon = { code: coupon.code, discount };
  await cart.save();

  res.status(200).json({
    success: true,
    message: `Coupon applied! You saved ₹${discount}`,
    cart,
    summary: buildSummary(cart),
  });
});

// @desc    Remove coupon
// @route   DELETE /api/v1/cart/coupon
// @access  Private
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = { code: "", discount: 0 };
  await cart.save();
  res.status(200).json({ success: true, message: "Coupon removed", cart, summary: buildSummary(cart) });
});

// @desc    Restore abandoned cart via recovery token
// @route   GET /api/v1/cart/restore/:token
// @access  Public
export const restoreAbandonedCart = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const cart = await Cart.findOne({ recoveryToken: token }).populate("items.product");

  if (!cart) throw new ApiError(404, "Invalid or expired recovery link");

  cart.recoveryStatus = "Recovered";
  await cart.save();

  res.status(200).json({ success: true, message: "Cart restored successfully", cart, summary: buildSummary(cart) });
});

// @desc    Get all abandoned carts (Admin)
// @route   GET /api/v1/cart/admin/abandoned
// @access  Admin
export const getAdminAbandonedCarts = asyncHandler(async (req, res) => {
  const carts = await Cart.find({ isAbandoned: true })
    .populate("user", "name email phone")
    .populate("items.product", "name price images")
    .sort("-abandonedAt");

  const totalAbandoned = carts.length;
  const recoveredCount = carts.filter((c) => c.recoveryStatus === "Recovered").length;
  const recoveryRate = totalAbandoned > 0 ? Math.round((recoveredCount / totalAbandoned) * 100) : 0;
  const recoveredRevenue = carts
    .filter((c) => c.recoveryStatus === "Recovered")
    .reduce((sum, c) => sum + (c.items?.reduce((a, b) => a + b.price * b.quantity, 0) || 0), 0);

  res.status(200).json({
    success: true,
    stats: {
      totalAbandoned,
      recoveredCount,
      recoveryRate,
      recoveredRevenue,
    },
    carts,
  });
});

export { buildSummary, SHIPPING_FEE, SHIPPING_THRESHOLD };
