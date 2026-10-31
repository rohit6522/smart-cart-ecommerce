import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  _id?: string;
  product: mongoose.Types.ObjectId | any;
  variantId?: string;
  variantLabel?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId | string;
  guestId?: string;
  items: ICartItem[];
  coupon?: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    discountAmount: number;
  };
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: String },
  variantLabel: { type: String },
  selectedSize: { type: String },
  selectedColor: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 },
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    guestId: { type: String, sparse: true },
    items: [CartItemSchema],
    coupon: {
      code: { type: String },
      discountType: { type: String, enum: ["percentage", "fixed"] },
      discountValue: { type: Number },
      discountAmount: { type: Number, default: 0 },
    },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.index({ user: 1 });
CartSchema.index({ guestId: 1 });

export const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
