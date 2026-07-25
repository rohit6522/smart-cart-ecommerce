"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface CartContextType {
  itemCount: number;
  setItemCount: (count: number) => void;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    try {
      // Dynamic import avoids a circular dependency with axios/auth setup
      const { getCart } = await import("@/lib/cartApi");
      const cart = await getCart();
      const totalQty = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(totalQty);
    } catch {
      setItemCount(0);
    }
  }, []);

  return (
    <CartContext.Provider value={{ itemCount, setItemCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}