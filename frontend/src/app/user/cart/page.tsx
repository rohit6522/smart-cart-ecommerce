"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CartItemRow from "@/components/user/CartItemRow";
import { getCart, updateCartItem, removeCartItem } from "@/lib/cartApi";
import { CartResponse, CouponInfo } from "@/types";
import { ArrowLeft, ShoppingCart, ShoppingBag, CreditCard, Tag } from "lucide-react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { getMyCoupons, applyCoupon } from "@/lib/couponApi";

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
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse" />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="text-blue-600" size={26} />
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          {!isEmpty && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              {cart.items.length} {cart.items.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        {isEmpty ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link
              href="/user"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items list */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl px-6">
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
              <div className="py-4">
                <button
                  onClick={() => router.push("/user")}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ArrowLeft size={16} /> Continue Shopping
                </button>
              </div>
            </div>

            {/* Right: Promo + Summary */}
            <div className="space-y-5">
              {/* Promo code box - the ONLY coupon UI block on this page */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a promo code?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 text-green-700 text-sm px-3 py-2.5 rounded-lg">
                    <span className="font-medium">
                      ✓ {appliedCoupon.code} applied (-₹
                      {appliedCoupon.discountAmount.toFixed(2)})
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-800 hover:underline text-xs"
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
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="E.g. WELCOME1000"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={applyingCoupon}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-600 text-xs mt-1.5">{couponError}</p>
                    )}
                  </>
                )}

                {myCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-gray-400">Your available coupons:</p>
                    {myCoupons.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPromoCode(c.code)}
                        className="w-full flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs hover:bg-orange-100 transition text-left"
                      >
                        <Tag size={12} className="text-orange-600 flex-shrink-0" />
                        <span className="font-mono font-bold text-orange-700">{c.code}</span>
                        <span className="text-orange-600">— {c.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-medium">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax</span>
                    <span className="text-gray-900 font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total amount</span>
                  <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => router.push("/user/checkout")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-5 transition"
                >
                  <CreditCard size={17} /> Proceed to Checkout
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">
                  🔒 Secure SSL Checkout
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