"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BudgetTracker from "@/components/user/BudgetTracker";
import CartItemRow from "@/components/user/CartItemRow";
import { getCart, updateCartItem, removeCartItem, setBudget } from "@/lib/cartApi";
import { checkout } from "@/lib/orderApi";
import { CartResponse } from "@/types";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

function CartContent() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
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

  const handleSetBudget = async (amount: number) => {
    const updated = await setBudget(amount);
    setCart(updated);
  };

  const handleCheckout = async () => {
    setError("");

    if (!address.trim()) {
      setError("Please enter a delivery address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await checkout(address);
      router.push(`/user/orders/${order.orderId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Checkout failed. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/user/products")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

        {/* Budget Tracker always visible at top of cart */}
        <div className="mb-6">
          <BudgetTracker cart={cart} onSetBudget={handleSetBudget} />
        </div>

        {isEmpty ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link
              href="/user/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Checkout section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-gray-600">Cart Total</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{cart.cartTotal.toFixed(2)}
                </span>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-3">
                  {error}
                </div>
              )}

              {cart.overBudget && (
                <div className="bg-yellow-50 text-yellow-700 text-sm px-4 py-2 rounded-lg mb-3">
                  Heads up — you&apos;re over your set budget. You can still place the order if you&apos;d like.
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={placingOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
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