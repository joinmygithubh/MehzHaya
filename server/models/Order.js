import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    isReturnRequested: { type: Boolean, default: false },
    returnStatus: { type: String, default: "None" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      required: true,
    },
    paymentInfo: {
      id: { type: String, default: "" }, // razorpay_payment_id
      orderId: { type: String, default: "" }, // razorpay_order_id
      signature: { type: String, default: "" },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded"],
        default: "Pending",
      },
    },

    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },

    couponCode: { type: String, default: "" },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    isReturnRequested: { type: Boolean, default: false },
    returnStatus: {
      type: String,
      enum: [
        "None",
        "Requested",
        "Pending Review",
        "Approved",
        "Rejected",
        "Received",
        "Refunded",
        "Completed",
        "Cancelled",
      ],
      default: "None",
    },
    returnRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "Return" },
    isExchangeRequested: { type: Boolean, default: false },
    exchangeStatus: {
      type: String,
      enum: [
        "None",
        "EXCHANGE_REQUESTED",
        "EXCHANGE_APPROVED",
        "PRODUCT_PICKUP_PENDING",
        "PRODUCT_RECEIVED",
        "NEW_PRODUCT_SHIPPED",
        "EXCHANGE_COMPLETED",
        "EXCHANGE_REJECTED",
        "EXCHANGE_CANCELLED",
      ],
      default: "None",
    },
    exchangeRequestId: { type: mongoose.Schema.Types.ObjectId, ref: "Exchange" },
    statusHistory: [
      {
        status: String,
        note: String,
        date: { type: Date, default: Date.now },
      },
    ],

    deliveredAt: Date,
    paidAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
