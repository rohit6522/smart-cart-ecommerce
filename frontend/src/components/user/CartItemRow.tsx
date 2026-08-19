"use client";

import { useState } from "react";
import { CartItem } from "@/types";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  onRemove: (cartItemId: number) => Promise<void>;
}

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
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
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: removing ? 0.4 : 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-0"
    >
      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <ShoppingCart className="text-gray-300" size={26} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
  <h4 className="font-semibold text-gray-900">{item.productName}</h4>
  {item.variantLabel && (
    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1">
      {item.variantLabel}
    </span>
  )}
  <p className="text-sm text-gray-400 mt-0.5">₹{item.priceAtAdd.toFixed(2)} each</p>
</div>
          <span className="font-bold text-gray-900 whitespace-nowrap">
            ₹{item.subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-1 py-1">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={updating || removing}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md disabled:opacity-50"
            >
              <Minus size={13} />
            </button>
            <span className="w-6 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={updating || removing}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md disabled:opacity-50"
            >
              <Plus size={13} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}
