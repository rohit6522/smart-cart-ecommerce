"use client";

import { useState } from "react";
import { Product } from "@/types";
import { ShoppingCart, Plus, Minus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number, quantity: number) => Promise<void>;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
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

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ShoppingCart className="text-gray-300" size={36} />
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-blue-600 font-medium mb-1">{product.category}</span>
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
          <span className={`text-xs ${outOfStock ? "text-red-500" : "text-gray-400"}`}>
            {outOfStock ? "Out of stock" : `${product.stockQuantity} in stock`}
          </span>
        </div>

        {!outOfStock && (
          <>
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={adding}
              className={`w-full py-2 rounded-lg font-medium text-sm transition ${
                added
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } disabled:opacity-50`}
            >
              {added ? "Added ✓" : adding ? "Adding..." : "Add to Cart"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}