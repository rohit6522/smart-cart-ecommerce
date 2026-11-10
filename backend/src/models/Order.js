const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    customerName: { type: String, default: "Customer" },
    customerPhone: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "RETURN_REJECTED",
      ],
      default: "CONFIRMED",
    },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    items: [OrderItemSchema],
    deliveryBoyId: { type: Number, default: null },
    deliveryBoyName: { type: String, default: null },
    deliveryBoyPhone: { type: String, default: null },
    paymentStatus: { type: String, default: "PAID" },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    couponCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    cancellationReason: { type: String, default: null },
    returnReason: { type: String, default: null },
    deliveredAt: { type: Date, default: null },
    returnRequestedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);
