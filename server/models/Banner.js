import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    image: {
      public_id: { type: String, default: "" },
      url: { type: String, required: true },
    },
    link: { type: String, default: "/shop" },
    buttonText: { type: String, default: "Shop Now" },
    position: {
      type: String,
      enum: ["hero", "promo", "flash"],
      default: "hero",
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
