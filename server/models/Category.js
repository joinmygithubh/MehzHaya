import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: { type: String, unique: true, index: true },
    group: {
      type: String,
      enum: ["Hijabs", "Islamic Wear", "Accessories"],
      required: true,
    },
    description: { type: String, default: "" },
    image: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
