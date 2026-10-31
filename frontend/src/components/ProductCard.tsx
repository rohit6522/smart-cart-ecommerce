"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import RatingStars from "./RatingStars";

export interface ProductCardProps {
  product: {
    _id: string;
    id?: string | number;
    name: string;
    slug: string;
    brand: string;
    category?: any;
    price: number;
    compareAtPrice?: number;
    discountPercentage?: number;
    stock: number;
    images?: { url: string; altText?: string }[];
    imageUrl?: string; // fallback
    rating?: number;
    averageRating?: number;
    numReviews?: number;
    totalReviews?: number;
    variants?: any[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const productId = product._id || product.id?.toString() || "";
  const isFavorited = isInWishlist(productId);

  // Determine main image
  const mainImage =
    product.images?.[0]?.url ||
    product.imageUrl ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

  const ratingScore = product.rating ?? product.averageRating ?? 4.5;
  const reviewCount = product.numReviews ?? product.totalReviews ?? 24;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100/80 shadow-xs hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Thumbnail Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-square bg-slate-50 overflow-hidden"
      >
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <div className="absolute top-3 left-3 bg-orange-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
            -{product.discountPercentage}%
          </div>
        ) : null}

        {/* Low Stock Urgency Tag */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Only {product.stock} left!
          </div>
        )}

        {/* Out of stock overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-slate-900 font-bold text-xs uppercase px-3 py-1 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? "bg-red-50 text-red-500 shadow-sm"
              : "bg-white/80 backdrop-blur-xs text-slate-600 hover:text-red-500 hover:bg-white shadow-xs"
          }`}
          title={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
      </Link>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <RatingStars rating={ratingScore} size="sm" showScore={false} />
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="block text-sm font-bold text-slate-900 hover:text-orange-600 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-2 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-600 line-through">
                  ₹{product.compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              Free Express Shipping
            </span>
          </div>

          {/* Quick Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || adding}
            className={`p-2.5 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
              added
                ? "bg-emerald-600 text-white"
                : product.stock <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-orange-600 text-white shadow-xs hover:shadow-md hover:shadow-orange-600/20"
            }`}
            title={added ? "Added!" : "Quick Add to Cart"}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : adding ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
