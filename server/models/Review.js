import mongoose from "mongoose";

/**
 * Verified Review collection for MehzHaya E-commerce.
 */
const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderItem: { type: String, default: "" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
      index: true,
    },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate review per user, product, and order
reviewSchema.index({ order: 1, product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
