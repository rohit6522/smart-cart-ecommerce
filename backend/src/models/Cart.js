const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  priceAtAdd: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
  variantLabel: { type: String, default: null },
});

const CartSchema = new mongoose.Schema(
  {
    cartId: { type: Number, unique: true, sparse: true },
    userId: { type: Number, required: true, unique: true, index: true },
    totalBudget: { type: Number, default: 0 },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
