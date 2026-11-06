"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CartItemRow from "@/components/user/CartItemRow";
import { getCart, updateCartItem, removeCartItem } from "@/lib/cartApi";
import { CartResponse, CouponInfo } from "@/types";
import {
  ArrowLeft,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { getMyCoupons, applyCoupon } from "@/lib/couponApi";
import EmptyState from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/formatCurrency";

function CartContent() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const router = useRouter();
  const [myCoupons, setMyCoupons] = useState<CouponInfo[]>([]);
  const { refreshCartCount } = useCart();

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    getMyCoupons()
      .then(setMyCoupons)
      .catch(() => {});
  }, []);

  const handleApplyPromo = async () => {
    if (applyingCoupon) return; // prevent double-submit
    if (!promoCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const result = await applyCoupon(promoCode.trim());
      setAppliedCoupon({
        code: result.code,
        discountAmount: result.discountAmount,
      });
      // Carry it forward so Checkout page can pre-apply it without retyping
      sessionStorage.setItem("pendingCoupon", result.code);
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    sessionStorage.removeItem("pendingCoupon");
  };

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    const updated = await updateCartItem(cartItemId, quantity);
    setCart(updated);
    refreshCartCount();
  };

  const handleRemove = async (cartItemId: number) => {
    const updated = await removeCartItem(cartItemId);
    setCart(updated);
    refreshCartCount();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar title="Smart Cart" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          <div className="h-72 bg-white border border-slate-200/80 rounded-3xl shadow-xs animate-pulse" />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  const subtotal = cart?.cartTotal ?? 0;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const tax = (subtotal - discount) * 0.06;
  const total = subtotal - discount + tax;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <ShoppingCart size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Your Cart
          </h1>
          {!isEmpty && (
            <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-3 py-1 rounded-full">
              {cart.items.length} {cart.items.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        {isEmpty ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Start exploring our products!"
            actionLabel="Browse Products"
            actionHref="/user"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items list */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl shadow-xs px-5 sm:px-7">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
              <div className="py-4 border-t border-slate-100">
                <button
                  onClick={() => router.push("/user")}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold group transition-colors"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Continue Shopping
                </button>
              </div>
            </div>

            {/* Right: Promo + Summary */}
            <div className="space-y-5">
              {/* Promo code box */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-6">
                <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                  Have a promo code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-sm px-3.5 py-2.5 rounded-xl font-medium">
                    <span>
                      ✓ {appliedCoupon.code} applied (-₹
                      {appliedCoupon.discountAmount.toFixed(2)})
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 hover:underline text-xs font-semibold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        placeholder="E.g. WELCOME1000"
                        className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-mono tracking-wider transition-all placeholder:font-sans placeholder:tracking-normal text-slate-900"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={applyingCoupon}
                        className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-rose-600 text-xs mt-2 font-medium">
                        {couponError}
                      </p>
                    )}
                  </>
                )}

                {myCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-400">
                      Available for you:
                    </p>
                    {myCoupons.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPromoCode(c.code)}
                        className="w-full flex items-center gap-2 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl px-3 py-2 text-xs transition text-left group"
                      >
                        <Tag
                          size={13}
                          className="text-amber-600 flex-shrink-0 group-hover:rotate-12 transition-transform"
                        />
                        <span className="font-mono font-bold text-amber-800">
                          {c.code}
                        </span>
                        <span className="text-amber-700 font-medium truncate">
                          — {c.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4 tracking-tight">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="text-slate-900 font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount</span>
                      <span>
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax (6%)</span>
                    <span className="text-slate-900 font-semibold">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-base">
                    Total amount
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {formatCurrency(total)}
                  </span>
                </div>

                <button
                  onClick={() => router.push("/user/checkout")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl mt-6 shadow-sm hover:shadow-md transition-all text-sm sm:text-base"
                >
                  <CreditCard size={18} /> Proceed to Checkout
                </button>

                <p className="text-center text-xs text-slate-400 mt-3 font-medium flex items-center justify-center gap-1">
                  <span>🔒</span> Secure 256-bit SSL Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <CartContent />
    </ProtectedRoute>
  );
}
