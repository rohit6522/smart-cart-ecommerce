"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: any[];
  wishlistedIds: Set<string>;
  toggleWishlist: (productId: string | number) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setWishlistedIds(new Set());
      return;
    }

    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const items = data.wishlist || [];
        setWishlist(items);
        const ids = new Set<string>(
          items.map((item: any) => (item._id || item.id || item).toString())
        );
        setWishlistedIds(ids);
      }
    } catch {
      // Fallback
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const toggleWishlist = useCallback(
    async (productId: string | number) => {
      const idStr = productId.toString();
      const isWishlisted = wishlistedIds.has(idStr);

      // Optimistic update
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) next.delete(idStr);
        else next.add(idStr);
        return next;
      });

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: idStr }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.wishlist) {
            setWishlist(data.wishlist);
          }
        }
      } catch {
        // Revert on failure
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          if (isWishlisted) next.add(idStr);
          else next.delete(idStr);
          return next;
        });
      }
    },
    [wishlistedIds]
  );

  const isInWishlist = (productId: string | number) => {
    return wishlistedIds.has(productId.toString());
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistedIds,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
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
