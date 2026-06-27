import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: "" },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: { type: Number, required: true, min: 0 },
    minPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 }, // 0 = no cap (for percentage)
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (cartTotal) {
  if (!this.isActive) return { valid: false, reason: "Coupon is inactive" };
  if (this.expiresAt < Date.now())
    return { valid: false, reason: "Coupon has expired" };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit)
    return { valid: false, reason: "Coupon usage limit reached" };
  if (cartTotal < this.minPurchase)
    return {
      valid: false,
      reason: `Minimum purchase of ₹${this.minPurchase} required`,
    };
  return { valid: true };
};

couponSchema.methods.computeDiscount = function (cartTotal) {
  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (cartTotal * this.discountValue) / 100;
    if (this.maxDiscount > 0) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = this.discountValue;
  }
  return Math.round(Math.min(discount, cartTotal));
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
