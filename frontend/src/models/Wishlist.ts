import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId | string;
  products: mongoose.Types.ObjectId[] | any[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1 });

export const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
