"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import AssignDeliveryModal from "@/components/admin/AssignDeliveryModal";
import { getAllOrders, updateOrderStatus } from "@/lib/orderApi";
import { OrderResponse, OrderStatus } from "@/types";
import { ArrowLeft, Package, Truck } from "lucide-react";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrdersContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [assignModalOrderId, setAssignModalOrderId] = useState<number | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data.slice().reverse());
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Panel" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus | "ALL")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Package className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        Order #{order.orderId}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹
                      {order.totalAmount.toFixed(2)} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{order.deliveryAddress}</p>
                    {order.deliveryBoyName && (
                      <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <Truck size={12} /> Assigned to {order.deliveryBoyName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.orderId, e.target.value as OrderStatus)
                      }
                      disabled={updatingId === order.orderId}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>

                    {!order.deliveryBoyName && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => setAssignModalOrderId(order.orderId)}
                        className="flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        <Truck size={14} /> Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AssignDeliveryModal
        isOpen={assignModalOrderId !== null}
        onClose={() => setAssignModalOrderId(null)}
        orderId={assignModalOrderId}
        onAssigned={fetchOrders}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminOrdersContent />
    </ProtectedRoute>
  );
}