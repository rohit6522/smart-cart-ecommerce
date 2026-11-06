"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusTabs from "@/components/user/OrderStatusTabs";
import CancelReturnModal from "@/components/user/CancelReturnModal";
import { getMyOrders, cancelOrder, requestReturn } from "@/lib/orderApi";
import { OrderResponse, OrderStatus } from "@/types";
import {
  Truck,
  FileText,
  Package,
  ShoppingCart,
  XCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

type TabKey = "ALL" | "PROCESSING" | "SHIPPED" | "DELIVERED";

const STATUS_TO_TAB: Record<OrderStatus, TabKey> = {
  PENDING: "PROCESSING",
  CONFIRMED: "PROCESSING",
  OUT_FOR_DELIVERY: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "PROCESSING",
  RETURN_REQUESTED: "DELIVERED",
  RETURNED: "DELIVERED",
  RETURN_REJECTED: "DELIVERED",
};

const STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200/60",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200/60",
  OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200/60",
  RETURN_REQUESTED: "bg-orange-50 text-orange-700 border border-orange-200/60",
  RETURNED: "bg-slate-100 text-slate-700 border border-slate-200/60",
  RETURN_REJECTED: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  OUT_FOR_DELIVERY: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  RETURN_REQUESTED: "RETURN REQUESTED",
  RETURNED: "RETURNED",
  RETURN_REJECTED: "RETURN REJECTED",
};

const STATUS_MESSAGE: Record<OrderStatus, string> = {
  PENDING: "Your order has been placed and is awaiting confirmation.",
  CONFIRMED: "Your order has been confirmed and is being prepared.",
  OUT_FOR_DELIVERY: "Your package is currently in transit.",
  DELIVERED: "Your package has been delivered.",
  CANCELLED: "This order was cancelled.",
  RETURN_REQUESTED: "Your return request is being reviewed.",
  RETURNED: "This order has been returned and refunded.",
  RETURN_REJECTED: "Your return request was not approved.",
};
function OrderHistoryContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const router = useRouter();
  const [modalOrder, setModalOrder] = useState<OrderResponse | null>(null);
  const [modalMode, setModalMode] = useState<"cancel" | "return">("cancel");

  const fetchOrders = () => {
    getMyOrders()
      .then((data) => setOrders(data.slice().reverse()))
      .catch((err) => console.error("Failed to fetch orders", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (reason: string) => {
    if (!modalOrder) return;
    await cancelOrder(modalOrder.orderId, reason);
    fetchOrders();
  };

  const handleReturn = async (reason: string) => {
    if (!modalOrder) return;
    await requestReturn(modalOrder.orderId, reason);
    fetchOrders();
  };

  const openCancelModal = (order: OrderResponse) => {
    setModalOrder(order);
    setModalMode("cancel");
  };

  const openReturnModal = (order: OrderResponse) => {
    setModalOrder(order);
    setModalMode("return");
  };

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      ALL: orders.length,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
    };
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
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <BackButton href="/user/profile" label="Back to Profile" />

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6 mt-2">My Orders</h1>

        <OrderStatusTabs
          active={activeTab}
          onChange={setActiveTab}
          counts={counts}
        />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white border border-slate-200/80 rounded-3xl animate-pulse shadow-xs"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders here yet"
            description="Orders in this category will show up here once you place them."
            actionLabel="Start Shopping"
            actionHref="/user"
          />
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
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex flex-wrap gap-4 sm:gap-8 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs font-medium">Order Placed</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-medium">Total</p>
                        <p className="font-bold text-slate-900 mt-0.5">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-medium">Order ID</p>
                        <p className="font-mono font-semibold text-slate-800 mt-0.5">
                          #ORD-{order.orderId}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        window.open(
                          `/user/orders/${order.orderId}/invoice`,
                          "_blank",
                        )
                      }
                      className="inline-flex items-center gap-1.5 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 bg-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all shadow-2xs"
                    >
                      <FileText size={14} /> View Invoice
                    </button>
                  </div>

                  {/* Status + delivery estimate */}
                  <div className="px-5 sm:px-6 py-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Truck size={20} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                          {order.status === "DELIVERED"
                            ? "Delivered"
                            : order.status === "CANCELLED"
                              ? "Order Cancelled"
                              : order.status === "RETURN_REQUESTED"
                                ? "Return Requested"
                                : order.status === "RETURNED"
                                  ? "Returned"
                                  : order.status === "RETURN_REJECTED"
                                    ? "Return Rejected"
                                    : `Arriving ${estimateDelivery(order.createdAt)}`}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE_STYLES[order.status]}`}
                        >
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {STATUS_MESSAGE[order.status]}
                      </p>
                      {order.status === "DELIVERED" && order.deliveredAt && (
                        <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1.5">
                          <CheckCircle2 size={13} />
                          Delivered on{" "}
                          {new Date(order.deliveredAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Item thumbnails */}
                  <div className="px-5 sm:px-6 pb-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="flex -space-x-3">
                      {visibleItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-white shadow-2xs overflow-hidden flex items-center justify-center"
                          style={{ zIndex: 10 - idx }}
                        >
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <ShoppingCart className="text-slate-300" size={20} />
                          )}
                        </div>
                      ))}
                      {extraCount > 0 && (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 shadow-2xs">
                          +{extraCount}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">
                        {firstItemName}
                      </span>
                      {otherCount > 0 &&
                        ` and ${otherCount} other item${otherCount > 1 ? "s" : ""}`}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="px-5 sm:px-6 pb-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                    {(order.status === "PENDING" ||
                      order.status === "CONFIRMED" ||
                      order.status === "OUT_FOR_DELIVERY") && (
                      <button
                        onClick={() =>
                          router.push(`/user/orders/${order.orderId}`)
                        }
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all"
                      >
                        Track Package
                      </button>
                    )}

                    <button
                      onClick={() =>
                        router.push(`/user/orders/${order.orderId}`)
                      }
                      className="flex-1 sm:flex-none border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-2xs"
                    >
                      View Order Details
                    </button>

                    {order.canCancel && (
                      <button
                        onClick={() => openCancelModal(order)}
                        className="flex items-center gap-1.5 text-sm text-rose-600 border border-rose-200 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-semibold transition-all"
                      >
                        <XCircle size={15} /> Cancel Order
                      </button>
                    )}

                    {order.canReturn && (
                      <button
                        onClick={() => openReturnModal(order)}
                        className="flex items-center gap-1.5 text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 px-4 py-2.5 rounded-xl font-semibold transition-all"
                      >
                        <RotateCcw size={15} /> Return Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      <CancelReturnModal
        isOpen={modalOrder !== null}
        onClose={() => setModalOrder(null)}
        mode={modalMode}
        onSubmit={modalMode === "cancel" ? handleCancel : handleReturn}
        deliveryAddress={modalOrder?.deliveryAddress}
      />
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
