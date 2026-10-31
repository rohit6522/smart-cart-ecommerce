"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, ChevronRight, Eye, AlertCircle } from "lucide-react";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setOrders(data?.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PLACED":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Order History</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review recent transactions, tracking details, and download invoices
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Once you complete a purchase, your order history and live delivery tracking will appear here.
          </p>
          <Link
            href="/products"
            className="inline-block mt-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 text-xs">
                <div>
                  <span className="text-slate-600 font-medium">Order </span>
                  <span className="font-mono font-bold text-slate-900">
                    {order.orderNumber}
                  </span>
                  <span className="text-slate-300 mx-2">•</span>
                  <span className="text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Items Snapshot Preview */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto">
                  {order.orderItems?.slice(0, 4).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.orderItems?.length > 4 && (
                    <span className="text-xs font-bold text-slate-600">
                      +{order.orderItems.length - 4} more
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-600">Total Amount</p>
                  <p className="text-base font-extrabold text-slate-900">
                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </p>
                  <Link
                    href={`/account/orders/${order._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 mt-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
