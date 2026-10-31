import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId | string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface IOrderStatusHistory {
  status:
    | "PLACED"
    | "PROCESSING"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId | string;
  orderNumber: string;
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "RAZORPAY" | "COD";
  paymentResult?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    paidAt?: Date;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  discountAmount: number;
  couponCode?: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  orderStatus:
    | "PLACED"
    | "PROCESSING"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  statusHistory: IOrderStatusHistory[];
  deliveryPartner?: {
    name?: string;
    phone?: string;
    trackingNumber?: string;
  };
  cancellationReason?: string;
  returnReason?: string;
  refundStatus?: "NONE" | "REQUESTED" | "PROCESSED" | "REJECTED";
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variantId: { type: String },
  variantLabel: { type: String },
  selectedSize: { type: String },
  selectedColor: { type: String },
});

const StatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: {
    type: String,
    enum: [
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    orderItems: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    paymentMethod: { type: String, enum: ["RAZORPAY", "COD"], required: true },
    paymentResult: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      paidAt: { type: Date },
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
      default: "PLACED",
    },
    statusHistory: [StatusHistorySchema],
    deliveryPartner: {
      name: { type: String },
      phone: { type: String },
      trackingNumber: { type: String },
    },
    cancellationReason: { type: String },
    returnReason: { type: String },
    refundStatus: {
      type: String,
      enum: ["NONE", "REQUESTED", "PROCESSED", "REJECTED"],
      default: "NONE",
    },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ "paymentResult.razorpayOrderId": 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
