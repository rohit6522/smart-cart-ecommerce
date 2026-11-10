const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    wishlistId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    productId: { type: Number, required: true },
  },
  { timestamps: true }
);

WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
