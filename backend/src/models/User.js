const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  id: { type: Number },
  label: { type: String, default: "Home" },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN", "DELIVERY_BOY"], default: "USER" },
    phone: { type: String, default: "" },
    profilePhoto: { type: String, default: null },
    referralCode: { type: String, default: "" },
    referredBy: { type: String, default: null },
    addresses: [AddressSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

