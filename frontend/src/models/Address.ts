import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddressDoc extends Document {
  user: mongoose.Types.ObjectId | string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  label: "Home" | "Work" | "Other";
  createdAt: Date;
  updatedAt: Date;
}

const AddressDocSchema = new Schema<IAddressDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
    label: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
  },
  { timestamps: true }
);

AddressDocSchema.index({ user: 1 });

export const Address: Model<IAddressDoc> =
  mongoose.models.Address || mongoose.model<IAddressDoc>("Address", AddressDocSchema);

export default Address;
