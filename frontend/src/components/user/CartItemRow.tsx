"use client";
import { CartItem } from "@/types";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
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

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;

    // Update the displayed number instantly for responsive feel
    setLocalQuantity(newQty);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setUpdating(true);
      try {
        await onUpdateQuantity(item.id, newQty);
      } catch (err) {
        console.error("Failed to update quantity", err);
        setLocalQuantity(item.quantity); // revert display on failure
      } finally {
        setUpdating(false);
      }
    }, 400);
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
      className="flex items-start gap-4 py-5 border-b border-slate-100 last:border-0 transition-colors"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-2xs">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <ShoppingCart className="text-slate-300" size={26} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate tracking-tight">
              {item.productName}
            </h4>
            {item.variantLabel && (
              <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full mt-1 border border-slate-200/50">
                {item.variantLabel}
              </span>
            )}
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              ₹{item.priceAtAdd.toFixed(2)} each
            </p>
          </div>
          <span className="font-bold text-slate-900 whitespace-nowrap text-sm sm:text-base flex-shrink-0 tracking-tight">
            ₹{item.subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2.5 sm:mt-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={removing || updating}
              aria-label="Decrease quantity"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white active:scale-90 transition-all disabled:opacity-40"
            >
              <Minus size={13} />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-slate-800">
              {localQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={removing || updating}
              aria-label="Increase quantity"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white active:scale-90 transition-all disabled:opacity-40"
            >
              <Plus size={13} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50 active:scale-95 px-2.5 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}
