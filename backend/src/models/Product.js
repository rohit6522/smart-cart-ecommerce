const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
  id: { type: Number },
  variantType: { type: String, default: "Standard" }, // Size, Color, etc.
  variantValue: { type: String, required: true },
  stockQuantity: { type: Number, default: 0 },
  price: { type: Number },
  sku: { type: String },
});

const ProductSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, sparse: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, default: "SmartCart" },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    images: [{ url: String, isPrimary: Boolean }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    variants: [VariantSchema],
    specifications: { type: Map, of: String, default: {} },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Auto compute discountedPrice and aliases on save
ProductSchema.pre("save", function (next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = Math.round(this.price * (1 - this.discountPercentage / 100));
  } else {
    this.discountedPrice = this.price;
  }
  this.stock = this.stockQuantity;
  this.rating = this.averageRating;
  this.numReviews = this.totalReviews;
  if (!this.imageUrl && this.images && this.images.length > 0) {
    this.imageUrl = this.images[0].url;
  }
  next();
});

module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);

