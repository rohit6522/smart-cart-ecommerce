const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, sparse: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "PERCENTAGE", "FLAT"],
      default: "PERCENTAGE",
    },
    discountValue: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 1000 },
    firstOrderOnly: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
