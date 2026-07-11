"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BudgetTracker from "@/components/user/BudgetTracker";
import { getCart, setBudget } from "@/lib/cartApi";
import { CartResponse } from "@/types";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";

function UserDashboardContent() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSetBudget = async (amount: number) => {
    try {
      const updated = await setBudget(amount);
      setCart(updated);
    } catch (err) {
      console.error("Failed to set budget", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Budget Tracker - takes 1 column */}
          <div className="md:col-span-1">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 animate-pulse h-40" />
            ) : (
              <BudgetTracker cart={cart} onSetBudget={handleSetBudget} />
            )}
          </div>

          {/* Quick Actions - takes 2 columns */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/user/products"
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col items-start gap-3"
            >
              <div className="bg-blue-50 p-3 rounded-xl">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Products</h3>
                <p className="text-sm text-gray-500">Shop within your budget</p>
              </div>
            </Link>

            <Link
              href="/user/cart"
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col items-start gap-3"
            >
              <div className="bg-green-50 p-3 rounded-xl">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  My Cart {cart && cart.items.length > 0 && `(${cart.items.length})`}
                </h3>
                <p className="text-sm text-gray-500">Review and checkout</p>
              </div>
            </Link>

            <Link
              href="/user/orders"
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col items-start gap-3 sm:col-span-2"
            >
              <div className="bg-purple-50 p-3 rounded-xl">
                <Package className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-500">Track your order history and delivery status</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}