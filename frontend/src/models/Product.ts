import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant {
  _id?: string;
  sku: string;
  size?: string;
  color?: string;
  colorCode?: string;
  price?: number;
  stock: number;
}

export interface IProductImage {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  category: mongoose.Types.ObjectId | string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  stock: number;
  sku: string;
  images: IProductImage[];
  variants: IProductVariant[];
  specifications: Record<string, string>;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  sku: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  colorCode: { type: String },
  price: { type: Number },
  stock: { type: Number, default: 0 },
});

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  altText: { type: String, default: "" },
  isPrimary: { type: Boolean, default: false },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    images: { type: [ProductImageSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    specifications: { type: Map, of: String, default: {} },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

// Indexes for high performance querying & faceted search
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

// Calculate discount percentage automatically
ProductSchema.pre("save", function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    this.discountPercentage = Math.round(
      ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
    );
  } else {
    this.discountPercentage = 0;
  }
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
