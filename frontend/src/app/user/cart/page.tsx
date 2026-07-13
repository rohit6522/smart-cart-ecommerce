"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CartItemRow from "@/components/user/CartItemRow";
import { getCart, updateCartItem, removeCartItem } from "@/lib/cartApi";
import { CartResponse } from "@/types";
import { ArrowLeft, ShoppingCart, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";

function CartContent() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const router = useRouter();

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
  }, []);

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    const updated = await updateCartItem(cartItemId, quantity);
    setCart(updated);
  };

  const handleRemove = async (cartItemId: number) => {
    const updated = await removeCartItem(cartItemId);
    setCart(updated);
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
  const tax = subtotal * 0.06; // 6% estimated tax, purely cosmetic for now
  const total = subtotal + tax;

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
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}

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
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a promo code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="E.g. SAVE20"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Apply
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
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

                <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure SSL Checkout</p>
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