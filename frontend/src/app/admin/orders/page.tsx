"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, Truck, Check, AlertCircle } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const url =
        filterStatus === "ALL"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const tabs = [
    { key: "ALL", label: "All Orders" },
    { key: "PLACED", label: "Placed" },
    { key: "PROCESSING", label: "Processing" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Fulfilment</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Track customer shipments, update order states, and assign delivery partners
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
              filterStatus === tab.key
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-extrabold tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Order Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfilment Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders found in this status category.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                      <span className="text-[10px] text-slate-600 block font-sans font-normal">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">
                        {ord.user?.name || ord.shippingAddress?.fullName}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {ord.orderItems?.length || 0} items
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{ord.totalPrice?.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.isPaid
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.isPaid ? "PAID" : "PENDING"} ({ord.paymentMethod})
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[11px] text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full uppercase">
                        {ord.orderStatus.replace(/_/g, " ")}
                      </span>
                      {ord.refundStatus && ord.refundStatus !== "NONE" && (
                        <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                          Return: {ord.refundStatus}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/admin/orders/${ord._id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
