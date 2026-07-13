"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import OrderStatusTabs from "@/components/user/OrderStatusTabs";
import { getMyOrders } from "@/lib/orderApi";
import { OrderResponse, OrderStatus } from "@/types";
import { Truck, FileText, Package, ShoppingCart } from "lucide-react";

type TabKey = "ALL" | "PROCESSING" | "SHIPPED" | "DELIVERED";

const STATUS_TO_TAB: Record<OrderStatus, TabKey> = {
  PENDING: "PROCESSING",
  CONFIRMED: "PROCESSING",
  OUT_FOR_DELIVERY: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "PROCESSING",
};

const STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  OUT_FOR_DELIVERY: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  OUT_FOR_DELIVERY: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const STATUS_MESSAGE: Record<OrderStatus, string> = {
  PENDING: "Your order has been placed and is awaiting confirmation.",
  CONFIRMED: "Your order has been confirmed and is being prepared.",
  OUT_FOR_DELIVERY: "Your package is currently in transit.",
  DELIVERED: "Your package has been delivered.",
  CANCELLED: "This order was cancelled.",
};

function OrderHistoryContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const router = useRouter();

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders(data.slice().reverse()))
      .catch((err) => console.error("Failed to fetch orders", err))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { ALL: orders.length, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0 };
    orders.forEach((o) => {
      const tab = STATUS_TO_TAB[o.status];
      c[tab]++;
    });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    return orders.filter((o) => STATUS_TO_TAB[o.status] === activeTab);
  }, [orders, activeTab]);

  const estimateDelivery = (createdAt: string) => {
    const d = new Date(createdAt);
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <OrderStatusTabs active={activeTab} onChange={setActiveTab} counts={counts} />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-white border border-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Package className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No orders in this category.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const visibleItems = order.items.slice(0, 3);
              const extraCount = order.items.length - visibleItems.length;
              const firstItemName = order.items[0]?.productName ?? "Item";
              const otherCount = order.items.length - 1;

              return (
                <div
                  key={order.orderId}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Order Placed</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Total</p>
                        <p className="font-semibold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Order ID</p>
                        <p className="font-semibold text-gray-900">#ORD-{order.orderId}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => window.open(`/user/orders/${order.orderId}/invoice`, "_blank")}
                      className="flex items-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium px-3.5 py-2 rounded-lg"
                    >
                      <FileText size={14} /> View Invoice
                    </button>
                  </div>

                  {/* Status + delivery estimate */}
                  <div className="px-6 py-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Truck className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {order.status === "DELIVERED"
                            ? "Delivered"
                            : order.status === "CANCELLED"
                            ? "Order Cancelled"
                            : `Arriving ${estimateDelivery(order.createdAt)}`}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE_STYLES[order.status]}`}
                        >
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{STATUS_MESSAGE[order.status]}</p>
                    </div>
                  </div>

                  {/* Item thumbnails */}
                  <div className="px-6 pb-5 flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {visibleItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-lg bg-gray-100 border-2 border-white overflow-hidden flex items-center justify-center"
                          style={{ zIndex: 10 - idx }}
                        >
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <ShoppingCart className="text-gray-300" size={20} />
                          )}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-sm font-medium text-gray-500">
                          +{extraCount}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">{firstItemName}</span>
                      {otherCount > 0 && ` and ${otherCount} other item${otherCount > 1 ? "s" : ""}`}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="px-6 pb-5 flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => router.push(`/user/orders/${order.orderId}`)}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg"
                    >
                      Track Package
                    </button>
                    <button
                      onClick={() => router.push(`/user/orders/${order.orderId}`)}
                      className="flex-1 sm:flex-none border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-5 py-2.5 rounded-lg"
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              );
            })}
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