import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  reason: { type: String, default: "Defective / Wrong Item" },
});

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [returnItemSchema],
    reason: {
      type: String,
      required: [true, "Return reason is required"],
    },
    comments: { type: String, default: "" },
    images: [
      {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],
    status: {
      type: String,
      enum: ["Requested", "Pending Review", "Approved", "Rejected", "Received", "Refunded", "Completed", "Cancelled"],
      default: "Requested",
    },
    refundAmount: { type: Number, default: 0 },
    adminNotes: { type: String, default: "" },
    cancelledAt: Date,
    cancelledBy: { type: String, enum: ["CUSTOMER", "ADMIN", "SYSTEM"] },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

const Return = mongoose.model("Return", returnSchema);
export default Return;
