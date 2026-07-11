"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/user/ProfileSidebar";
import { getMyOrders } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Truck, Clock } from "lucide-react";
import Link from "next/link";

function ProfileDashboardContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders(data.slice().reverse()))
      .catch((err) => console.error("Failed to load orders", err))
      .finally(() => setLoading(false));
  }, []);

  const inTransit = orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
  const pending = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-6">
        <ProfileSidebar />

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500 mb-6">Track your orders and manage your account here.</p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <ShoppingBag className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{loading ? "-" : orders.length}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-yellow-50 p-3 rounded-xl">
                <Truck className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">In Transit</p>
                <p className="text-xl font-bold text-gray-900">{loading ? "-" : inTransit}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-xl font-bold text-gray-900">{loading ? "-" : pending}</p>
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link href="/user/orders" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="h-20 bg-gray-50 rounded-lg animate-pulse" />
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.orderId}
                    href={`/user/orders/${order.orderId}`}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm hover:bg-gray-50 -mx-2 px-2 rounded"
                  >
                    <span className="text-gray-900 font-medium">#{order.orderId}</span>
                    <span className="text-gray-500">{order.items.length} items</span>
                    <span className="text-gray-500">{order.status.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <ProfileDashboardContent />
    </ProtectedRoute>
  );
}