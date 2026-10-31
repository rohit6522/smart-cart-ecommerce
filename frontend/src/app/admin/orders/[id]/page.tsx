"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, Truck, Check, MapPin, AlertCircle, Save } from "lucide-react";

export default function AdminOrderManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [orderStatus, setOrderStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryPartnerName, setDeliveryPartnerName] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [refundStatus, setRefundStatus] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.order) {
          const ord = data.order;
          setOrder(ord);
          setOrderStatus(ord.orderStatus);
          setTrackingNumber(ord.deliveryPartner?.trackingNumber || "");
          setDeliveryPartnerName(ord.deliveryPartner?.name || "CartNova Express");
          setRefundStatus(ord.refundStatus || "NONE");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus,
          trackingNumber,
          deliveryPartnerName,
          note: adminNote || `Status updated to ${orderStatus}`,
          refundStatus: refundStatus !== "NONE" ? refundStatus : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        setMessage("Order details updated successfully.");
        setAdminNote("");
      } else {
        setMessage(data.error || "Failed to update order");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading order...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-sm text-slate-500">Order not found</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Manage Order {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-600">
              Customer: <strong>{order.user?.name || order.shippingAddress?.fullName}</strong> (
              {order.user?.email})
            </p>
          </div>
          <span className="font-extrabold text-sm text-orange-600">
            Total: ₹{order.totalPrice?.toLocaleString("en-IN")}
          </span>
        </div>

        {message && (
          <div className="p-3.5 bg-slate-900 text-white text-xs font-semibold rounded-xl">
            {message}
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Fulfilment Status
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              >
                <option value="PLACED">PLACED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Courier / Delivery Partner
              </label>
              <input
                type="text"
                placeholder="CartNova Express / BlueDart"
                value={deliveryPartnerName}
                onChange={(e) => setDeliveryPartnerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tracking AWB Number
              </label>
              <input
                type="text"
                placeholder="TRK-9876543210"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {order.refundStatus && order.refundStatus !== "NONE" && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Return / Refund Moderation
                </label>
                <select
                  value={refundStatus}
                  onChange={(e) => setRefundStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="PROCESSED">PROCESSED (Restock &amp; Refund)</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Status Change Note (visible in history timeline)
              </label>
              <input
                type="text"
                placeholder="e.g. Package handed over to courier hub"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving ? "Updating..." : "Save Order Status"}
          </button>
        </form>

        {/* Purchased Items */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Order Items
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.orderItems?.map((it: any, i: number) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-slate-900">{it.name}</p>
                    <p className="text-slate-600">Qty: {it.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address Snapshot */}
        <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-slate-900">
            Shipping To: {order.shippingAddress?.fullName} ({order.shippingAddress?.phone})
          </p>
          <p>{order.shippingAddress?.street}</p>
          <p>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            {order.shippingAddress?.postalCode}
          </p>
        </div>
      </div>
    </div>
  );
}
