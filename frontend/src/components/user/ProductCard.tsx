"use client";

import { useState } from "react";
import { Product } from "@/types";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import StarRating from "./StarRating";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number, quantity: number) => Promise<void>;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await onAddToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      setQuantity(1);
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setAdding(false);
    }
  };

  const { wishlistedIds, toggleWishlist } = useWishlist();
  const isWishlisted = wishlistedIds.has(product.id);
  const outOfStock = product.stockQuantity <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all duration-200"
        >
          <Heart
            size={16}
            className={
              isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-slate-600"
            }
          />
        </button>

        {product.discountPercentage > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ShoppingCart className="text-slate-300" size={36} />
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
          {product.category}
        </span>
        <Link href={`/user/products/${product.id}`}>
          <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {product.totalReviews > 0 && (
          <div className="mb-1.5">
            <StarRating
              rating={product.averageRating}
              showCount={product.totalReviews}
            />
          </div>
        )}
        <p className="text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-baseline gap-2">
            {product.discountPercentage > 0 ? (
              <>
                <span className="text-base sm:text-lg font-extrabold text-slate-900">
                  ₹{product.discountedPrice.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                ₹{product.price.toFixed(2)}
              </span>
            )}
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              outOfStock
                ? "bg-rose-50 text-rose-600"
                : product.stockQuantity <= 5
                  ? "bg-amber-50 text-amber-700 animate-pulse"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {outOfStock
              ? "Out of stock"
              : product.stockQuantity <= 5
                ? `Only ${product.stockQuantity} left!`
                : `${product.stockQuantity} in stock`}
          </span>
        </div>

        {!outOfStock && (
          <>
            <div className="flex items-center justify-center gap-2 mb-3 bg-slate-100/70 border border-slate-200/60 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-xs hover:bg-slate-50 active:scale-95 text-slate-700 transition"
              >
                <Minus size={13} />
              </button>
              <span className="w-8 text-center text-xs font-bold text-slate-800">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                }
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-xs hover:bg-slate-50 active:scale-95 text-slate-700 transition"
              >
                <Plus size={13} />
              </button>
            </div>

            <motion.button
              onClick={handleAdd}
              disabled={adding || quantity > product.stockQuantity}
              whileTap={{ scale: 0.97 }}
              animate={added ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.25 }}
              className={`w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-md text-white shadow-blue-500/20"
              } disabled:opacity-50`}
            >
              {added
                ? "Added to Cart ✓"
                : adding
                  ? "Adding..."
                  : quantity > product.stockQuantity
                    ? "Exceeds Stock"
                    : "Add to Cart"}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
