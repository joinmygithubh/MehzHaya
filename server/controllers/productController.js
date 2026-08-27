import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Wishlist from "../models/Wishlist.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploadImage.js";

// @desc    Get all products (search, filter, sort, paginate)
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const resultsPerPage = Number(req.query.limit) || 12;

  if (req.query.category) {
    const catParam = String(req.query.category).trim();
    let catFilter = {};
    if (catParam.match(/^[0-9a-fA-F]{24}$/)) {
      catFilter = { _id: catParam };
    } else {
      const escaped = catParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      catFilter = {
        $or: [
          { slug: catParam.toLowerCase() },
          { name: new RegExp("^" + escaped + "$", "i") },
          { name: new RegExp(escaped, "i") },
        ],
      };
    }
    const catDoc = await Category.findOne(catFilter);
    if (catDoc) {
      req.query.categoryResolvedId = catDoc._id;
      req.query.categoryResolvedName = catDoc.name;
    }
  }

  const baseQuery = { isActive: true, isDeleted: { $ne: true } };

  // count after filters (without pagination)
  const countFeatures = new ApiFeatures(Product.find(baseQuery), req.query)
    .search()
    .filter();
  const filteredCount = await Product.countDocuments(countFeatures.query.getFilter());

  const features = new ApiFeatures(Product.find(baseQuery), req.query)
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
  const rawKeyword = typeof keyword === "string" ? keyword.trim() : "";
  if (!rawKeyword || rawKeyword.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }
  const sanitizedKeyword = rawKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const suggestions = await Product.find({
    isActive: true,
    isDeleted: { $ne: true },
    name: { $regex: sanitizedKeyword, $options: "i" },
  })
    .select("name slug images price discount")
    .limit(6);
  res.status(200).json({ success: true, suggestions });
});

// @desc    Get product groups with categories
// @route   GET /api/v1/products/sections/home
// @access  Public
export const getHomeSections = asyncHandler(async (req, res) => {
  const baseQuery = { isActive: true, isDeleted: { $ne: true } };
  const [featured, bestSellers, newArrivals, trending, flashSale] = await Promise.all([
    Product.find({ ...baseQuery, isFeatured: true }).limit(8).sort("-createdAt").lean(),
    Product.find(baseQuery).sort("-sold").limit(8).lean(),
    Product.find({ ...baseQuery, isNewArrival: true }).limit(8).sort("-createdAt").lean(),
    Product.find({ ...baseQuery, isTrending: true }).limit(8).sort("-views").lean(),
    Product.find({ ...baseQuery, isFlashSale: true }).limit(8).sort("-discount").lean(),
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
    ? { _id: idOrSlug, isDeleted: { $ne: true } }
    : { slug: idOrSlug, isDeleted: { $ne: true } };

  const product = await Product.findOne(query).populate("category", "name slug group");
  if (!product) throw new ApiError(404, "Product not found");

  // increment views (non-blocking)
  Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).exec();

  // related products (same category, exclude self)
  const related = await Product.find({
    _id: { $ne: product._id },
    categoryName: product.categoryName,
    isActive: true,
    isDeleted: { $ne: true },
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
  let newlyUploadedCloudinaryImages = [];

  if (req.files && req.files.length > 0) {
    newlyUploadedCloudinaryImages = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "mehzhaya/products"))
    );
    images = newlyUploadedCloudinaryImages;
  } else if (req.body.images) {
    const urls = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    images = urls.map((url) => ({ public_id: "", url }));
  }

  if (images.length === 0) throw new ApiError(400, "Please provide at least one product image");

  const parseArr = (v) => (typeof v === "string" ? JSON.parse(v) : v) || [];

  try {
    const product = await Product.create({
      ...req.body,
      images,
      colors: parseArr(req.body.colors),
      sizes: parseArr(req.body.sizes),
      categoryName: category.name,
      group: category.group,
      isDeleted: false,
      deletedAt: null,
    });

    await Category.updateOne({ _id: category._id }, { $inc: { productCount: 1 } });
    res.status(201).json({ success: true, message: "Product created", product });
  } catch (err) {
    // Transactional cleanup: clean up newly uploaded orphaned images if DB save fails
    if (newlyUploadedCloudinaryImages.length > 0) {
      await Promise.all(
        newlyUploadedCloudinaryImages
          .filter((img) => img.public_id)
          .map((img) => deleteFromCloudinary(img.public_id))
      );
    }
    throw err;
  }
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  const oldImages = [...product.images];
  const updates = { ...req.body };

  if (req.body.category && req.body.category.toString() !== product.category?.toString()) {
    const newCategory = await Category.findById(req.body.category);
    if (!newCategory) throw new ApiError(400, "Invalid category");
    
    if (product.category && !product.isDeleted) {
      await Category.updateOne({ _id: product.category }, { $inc: { productCount: -1 } });
    }
    if (!product.isDeleted) {
      await Category.updateOne({ _id: newCategory._id }, { $inc: { productCount: 1 } });
    }

    updates.categoryName = newCategory.name;
    updates.group = newCategory.group;
  }

  ["colors", "sizes"].forEach((k) => {
    if (updates[k] && typeof updates[k] === "string") updates[k] = JSON.parse(updates[k]);
  });

  let newlyUploadedCloudinaryImages = [];

  if (req.files && req.files.length > 0) {
    newlyUploadedCloudinaryImages = await Promise.all(
      req.files.map((f) => uploadToCloudinary(f.buffer, "mehzhaya/products"))
    );
    const existingImageUrls = req.body.images
      ? (typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images)
      : [];
    const existingImages = product.images.filter((img) =>
      existingImageUrls.includes(img.url)
    );
    updates.images = [...existingImages, ...newlyUploadedCloudinaryImages];
  } else if (req.body.images) {
    const urls = typeof req.body.images === "string" ? JSON.parse(req.body.images) : req.body.images;
    updates.images = urls.map((u) => {
      const existing = product.images.find((img) => img.url === u);
      return existing || { public_id: "", url: u };
    });
  }

  try {
    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    // Only after successful DB update confirmation, delete replaced old Cloudinary images
    if (updates.images) {
      const updatedUrls = new Set(product.images.map((img) => img.url));
      const replacedImages = oldImages.filter(
        (img) => img.public_id && !updatedUrls.has(img.url)
      );
      if (replacedImages.length > 0) {
        await Promise.all(
          replacedImages.map((img) => deleteFromCloudinary(img.public_id))
        );
      }
    }

    res.status(200).json({ success: true, message: "Product updated", product });
  } catch (err) {
    // If DB update fails, clean up newly uploaded unused images and keep old images
    if (newlyUploadedCloudinaryImages.length > 0) {
      await Promise.all(
        newlyUploadedCloudinaryImages
          .filter((img) => img.public_id)
          .map((img) => deleteFromCloudinary(img.public_id))
      );
    }
    throw err;
  }
});

// @desc    Delete single product image
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

// @desc    Soft delete product
// @route   DELETE /api/v1/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (!product.isDeleted) {
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.isActive = false;
    await product.save();

    await Category.updateOne({ _id: product.category }, { $inc: { productCount: -1 } });

    // Clean up stale product references across Cart, Wishlist, and User.recentlyViewed
    await Promise.all([
      Wishlist.updateMany({ products: product._id }, { $pull: { products: product._id } }),
      Cart.updateMany({ "items.product": product._id }, { $pull: { items: { product: product._id } } }),
      User.updateMany({ recentlyViewed: product._id }, { $pull: { recentlyViewed: product._id } }),
    ]);
  }

  res.status(200).json({ success: true, message: "Product soft-deleted", product });
});

// @desc    Restore soft-deleted product
// @route   PUT /api/v1/products/:id/restore
// @access  Admin
export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.isDeleted) {
    product.isDeleted = false;
    product.deletedAt = null;
    product.isActive = true;
    await product.save();

    await Category.updateOne({ _id: product.category }, { $inc: { productCount: 1 } });
  }

  res.status(200).json({ success: true, message: "Product restored successfully", product });
});

// @desc    Permanently delete product & Cloudinary images
// @route   DELETE /api/v1/products/:id/permanent
// @access  Admin
export const permanentDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  // Delete specific Cloudinary images
  await Promise.all(
    product.images
      .filter((img) => img.public_id)
      .map((img) => deleteFromCloudinary(img.public_id))
  );

  if (!product.isDeleted) {
    await Category.updateOne({ _id: product.category }, { $inc: { productCount: -1 } });
  }

  await product.deleteOne();

  // Clean up references
  await Promise.all([
    Wishlist.updateMany({ products: product._id }, { $pull: { products: product._id } }),
    Cart.updateMany({ "items.product": product._id }, { $pull: { items: { product: product._id } } }),
    User.updateMany({ recentlyViewed: product._id }, { $pull: { recentlyViewed: product._id } }),
  ]);

  res.status(200).json({ success: true, message: "Product permanently deleted" });
});

// @desc    Get all products (admin - includes soft-deleted)
// @route   GET /api/v1/products/admin/all
// @access  Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("-createdAt").populate("category", "name");
  res.status(200).json({ success: true, count: products.length, products });
});
