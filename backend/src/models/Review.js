const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    productId: { type: Number, required: true, index: true },
    userId: { type: Number, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
