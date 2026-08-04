import mongoose from "mongoose";
import slugify from "slugify";

const reviewSubSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, default: "" },
    images: [
      {
        public_id: { type: String, default: "" },
        url: { type: String, required: true },
      },
    ],
    isVerifiedPurchase: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Approved", "Hidden", "Pending"],
      default: "Approved",
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxlength: [140, "Name cannot exceed 140 characters"],
    },
    slug: { type: String, unique: true, index: true },
    sku: { type: String, unique: true, required: true, index: true },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    shortDescription: { type: String, default: "" },

    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    // percentage discount (0-100)
    discount: { type: Number, default: 0, min: 0, max: 90 },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: { type: String, required: true, index: true },
    group: {
      type: String,
      enum: ["Hijabs", "Islamic Wear", "Accessories"],
      required: true,
      index: true,
    },

    material: { type: String, default: "" },
    colors: [{ type: String }],
    sizes: [{ type: String }],

    images: [
      {
        public_id: { type: String, default: "" },
        url: { type: String, required: true },
      },
    ],

    stock: { type: Number, required: true, default: 0, min: 0 },

    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSubSchema],

    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: final price after discount
productSchema.virtual("finalPrice").get(function () {
  return Math.round(this.price - (this.price * this.discount) / 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

// Text index for search
productSchema.index({ name: "text", description: "text", categoryName: "text" });

productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug =
      slugify(this.name, { lower: true, strict: true }) +
      "-" +
      Math.random().toString(36).substring(2, 7);
  }
  next();
});

// Recalculate aggregate rating
productSchema.methods.calculateRatings = function () {
  const approved = this.reviews.filter((r) => r.status !== "Hidden");
  if (approved.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
    return;
  }
  const total = approved.reduce((acc, r) => acc + r.rating, 0);
  this.ratings = Math.round((total / approved.length) * 10) / 10;
  this.numReviews = approved.length;
};

const Product = mongoose.model("Product", productSchema);
export default Product;
