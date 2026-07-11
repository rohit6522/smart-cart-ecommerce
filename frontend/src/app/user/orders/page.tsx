"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import { getMyOrders } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { ArrowLeft, Package } from "lucide-react";

function OrderHistoryContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders(data.slice().reverse())) // newest first
      .catch((err) => console.error("Failed to fetch orders", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/user")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Package className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order.orderId}
                onClick={() => router.push(`/user/orders/${order.orderId}`)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-gray-900">Order #{order.orderId}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <OrderHistoryContent />
    </ProtectedRoute>
  );
}