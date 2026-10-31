import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  label?: "Home" | "Work" | "Other";
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "customer" | "admin" | "delivery";
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  budgetLimit?: number;
  referralCode?: string;
  referredBy?: string;
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
  label: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["customer", "admin", "delivery"], default: "customer" },
    phone: { type: String, trim: true },
    avatar: { type: String, default: "" },
    addresses: [AddressSchema],
    budgetLimit: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String },
    isEmailVerified: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
