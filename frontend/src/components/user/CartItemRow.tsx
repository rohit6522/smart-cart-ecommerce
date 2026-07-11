"use client";

import { useState } from "react";
import { CartItem } from "@/types";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  onRemove: (cartItemId: number) => Promise<void>;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;
    setUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQty);
    } catch (err) {
      console.error("Failed to update quantity", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.id);
    } catch (err) {
      console.error("Failed to remove item", err);
      setRemoving(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 transition ${
        removing ? "opacity-40" : ""
      }`}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ShoppingCart className="text-gray-300" size={24} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
        <p className="text-sm text-gray-500">₹{item.priceAtAdd.toFixed(2)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={updating || removing}
          className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={updating || removing}
          className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="w-20 text-right font-semibold text-gray-900">
        ₹{item.subtotal.toFixed(2)}
      </div>

      <button
        onClick={handleRemove}
        disabled={removing}
        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}