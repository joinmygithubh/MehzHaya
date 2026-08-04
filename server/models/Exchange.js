import mongoose from "mongoose";

const exchangeSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: "" },
    currentSize: { type: String, default: "" },
    requestedSize: { type: String, required: [true, "Requested size is required"] },
    reason: {
      type: String,
      required: [true, "Exchange reason is required"],
      default: "Size does not fit",
    },
    comments: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "EXCHANGE_REQUESTED",
        "EXCHANGE_APPROVED",
        "PRODUCT_PICKUP_PENDING",
        "PRODUCT_RECEIVED",
        "NEW_PRODUCT_SHIPPED",
        "EXCHANGE_COMPLETED",
        "EXCHANGE_REJECTED",
        "EXCHANGE_CANCELLED",
      ],
      default: "EXCHANGE_REQUESTED",
    },
    adminNotes: { type: String, default: "" },
    cancelledAt: Date,
    cancelledBy: { type: String, enum: ["CUSTOMER", "ADMIN", "SYSTEM"] },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

const Exchange = mongoose.model("Exchange", exchangeSchema);
export default Exchange;
