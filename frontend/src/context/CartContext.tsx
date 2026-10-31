"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartItemModel {
  _id?: string;
  product: {
    _id: string;
    name: string;
    slug?: string;
    price: number;
    compareAtPrice?: number;
    images?: { url: string; altText?: string }[];
    stock?: number;
    brand?: string;
  };
  variantId?: string;
  variantLabel?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  price: number;
}

export interface CouponModel {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
}

export interface CartState {
  items: CartItemModel[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon?: CouponModel | null;
}

interface CartContextType {
  cart: CartState;
  itemCount: number;
  loading: boolean;
  addToCart: (
    product: any,
    quantity?: number,
    options?: {
      variantId?: string;
      variantLabel?: string;
      selectedSize?: string;
      selectedColor?: string;
    }
  ) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const defaultCartState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  coupon: null,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(defaultCartState);
  const [loading, setLoading] = useState(true);

  const getGuestId = () => {
    if (typeof window === "undefined") return "guest-default";
    let gid = localStorage.getItem("cartnova_guest_id");
    if (!gid) {
      gid = "gid_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("cartnova_guest_id", gid);
    }
    return gid;
  };

  const calculateTotals = (items: CartItemModel[], coupon: CouponModel | null | undefined): CartState => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;

    if (coupon) {
      if (coupon.discountType === "percentage") {
        discount = Math.round((subtotal * coupon.discountValue) / 100);
      } else {
        discount = coupon.discountValue;
      }
      discount = Math.min(discount, subtotal);
    }

    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = Math.max(0, subtotal - discount + shipping + tax);

    return {
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      coupon,
    };
  };

  const refreshCart = useCallback(async () => {
    try {
      const guestId = getGuestId();
      const res = await fetch(`/api/cart?guestId=${guestId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.cart) {
          setCart(calculateTotals(data.cart.items || [], data.cart.coupon));
          return;
        }
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (
    product: any,
    quantity = 1,
    options?: {
      variantId?: string;
      variantLabel?: string;
      selectedSize?: string;
      selectedColor?: string;
    }
  ) => {
    try {
      const guestId = getGuestId();
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id || product.id,
          quantity,
          guestId,
          ...options,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Failed to add to cart" };
      }

      setCart(calculateTotals(data.cart.items || [], data.cart.coupon));
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || "Network error" };
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const item = cart.items.find((i) => (i._id || (i as any).id) === itemId);
      if (!item) return;

      const guestId = getGuestId();
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.product._id || (item.product as any).id,
          quantity,
          variantId: item.variantId,
          action: "set",
          guestId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(calculateTotals(data.cart.items || [], data.cart.coupon));
      }
    } catch {
      // Ignore
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const guestId = getGuestId();
      const res = await fetch(`/api/cart?itemId=${itemId}&guestId=${guestId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setCart(calculateTotals(data.cart.items || [], data.cart.coupon));
      }
    } catch {
      // Ignore
    }
  };

  const clearCart = async () => {
    try {
      const guestId = getGuestId();
      const res = await fetch(`/api/cart?clear=true&guestId=${guestId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCart(defaultCartState);
      }
    } catch {
      // Ignore
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartSubtotal: cart.subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Invalid coupon" };
      }

      setCart(calculateTotals(cart.items, data.coupon));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to validate coupon" };
    }
  };

  const removeCoupon = () => {
    setCart(calculateTotals(cart.items, null));
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
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
