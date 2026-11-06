import mongoose, { Schema, Document } from "mongoose";

export interface IProductDocument extends Document {
  id: number;
  name: string;
  slug?: string;
  brand?: string;
  category: string;
  description: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  stockQuantity: number;
  imageUrl: string;
  images: Array<{ url: string; isPrimary?: boolean; altText?: string }>;
  variants: Array<{ id: number; label: string; stock: number; priceModifier?: number }>;
  averageRating: number;
  totalReviews: number;
  isFeatured?: boolean;
  isActive?: boolean;
  specifications?: Record<string, string>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema({
  id: { type: Number },
  label: { type: String, required: true },
  stock: { type: Number, default: 0 },
  priceModifier: { type: Number, default: 0 },
});

const ProductSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    brand: { type: String, default: "SmartCart" },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        altText: { type: String, default: "" },
      },
    ],
    variants: [VariantSchema],
    averageRating: { type: Number, default: 4.5 },
    totalReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    specifications: { type: Map, of: String },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
