"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { getMyWishlist, addToWishlist, removeFromWishlist } from "@/lib/wishlistApi";

interface WishlistContextType {
  wishlistedIds: Set<number>;
  toggleWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set());

  const refreshWishlist = useCallback(async () => {
    try {
      const items = await getMyWishlist();
      setWishlistedIds(new Set(items.map((i) => i.product.id)));
    } catch {
      setWishlistedIds(new Set());
    }
  }, []);

  const toggleWishlist = useCallback(async (productId: number) => {
    const isWishlisted = wishlistedIds.has(productId);
    // Optimistic update
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (isWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch {
      // Revert on failure
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  }, [wishlistedIds]);

  return (
    <WishlistContext.Provider value={{ wishlistedIds, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}