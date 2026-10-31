"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  ChevronLeft,
  XCircle,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Order cancelled successfully.");
        setOrder(data.order);
        setCancelModalOpen(false);
      } else {
        setMessage(data.error || "Failed to cancel order");
      }
    } catch {
      setMessage("Network error while cancelling order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!confirm("Are you sure you want to request a return for this order?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return", reason: "Customer requested return" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Return request submitted successfully. Our courier will contact you.");
        setOrder(data.order);
      } else {
        setMessage(data.error || "Failed to request return");
      }
    } catch {
      setMessage("Network error while requesting return");
    } finally {
      setActionLoading(false);
    }
  };

  const timelineSteps = [
    { key: "PLACED", label: "Order Placed" },
    { key: "PROCESSING", label: "Processing" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PLACED":
        return 0;
      case "PROCESSING":
        return 1;
      case "SHIPPED":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return -1;
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center">
        <h2 className="text-xl font-bold text-slate-900">Order not found</h2>
        <Link
          href="/account/orders"
          className="inline-block mt-4 text-xs font-bold text-orange-600 underline"
        >
          Return to all orders
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" /> All Orders
        </Link>
      </div>

      {message && (
        <div className="p-3.5 bg-slate-100 text-slate-900 rounded-xl text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Main Order Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Order {order.orderNumber}
              </h1>
              {order.isPaid ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  PAID
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  PAYMENT PENDING
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Cancellation / Return Actions */}
          <div className="flex items-center gap-3">
            {["PLACED", "PROCESSING"].includes(order.orderStatus) && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel Order
              </button>
            )}

            {order.orderStatus === "DELIVERED" && order.refundStatus === "NONE" && (
              <button
                type="button"
                onClick={handleRequestReturn}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Return
              </button>
            )}

            {order.refundStatus && order.refundStatus !== "NONE" && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                Return Status: {order.refundStatus}
              </span>
            )}
          </div>
        </div>

        {/* Visual Timeline Tracker */}
        {isCancelled ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-1">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" /> This order was cancelled
            </h4>
            <p className="text-xs text-red-700">
              {order.cancellationReason || "Cancelled upon customer request."}
            </p>
          </div>
        ) : (
          <div className="py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-6">
              Live Shipment Progress
            </h3>

            {/* Stepper Bar */}
            <div className="relative flex items-center justify-between">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={step.key} className="flex-1 relative text-center">
                    {/* Connecting line */}
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-1 z-0 transition-colors ${
                          currentStep > idx ? "bg-orange-600" : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Step Icon / Dot */}
                    <div
                      className={`relative z-10 w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-orange-600 text-white ring-4 ring-orange-100 shadow-md"
                          : isPassed
                          ? "bg-orange-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>

                    <p
                      className={`text-[11px] font-bold mt-2 ${
                        isCurrent
                          ? "text-orange-600"
                          : isPassed
                          ? "text-slate-900"
                          : "text-slate-600"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {order.deliveryPartner?.trackingNumber && (
              <div className="mt-8 p-3 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-950 flex items-center justify-between">
                <span>
                  Courier: <strong>{order.deliveryPartner.name || "CartNova Express"}</strong>
                </span>
                <span>
                  Tracking #:{" "}
                  <strong className="font-mono">{order.deliveryPartner.trackingNumber}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Order Items List */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900">Purchased Items</h3>
          <div className="divide-y divide-slate-100">
            {order.orderItems?.map((item: any, idx: number) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-600">
                      ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                    </p>
                    {item.variantLabel && (
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                        {item.variantLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right font-extrabold text-sm text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Details: Shipping Address + Payment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 text-xs">
          {/* Shipping Address */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" /> Delivery Address
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="pt-1 font-semibold text-slate-900">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Payment Breakdown</h4>
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold">₹{order.itemsPrice?.toLocaleString("en-IN")}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>₹{order.taxPrice?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="text-orange-600">
                  ₹{order.totalPrice?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Cancel Order</h3>
            <p className="text-xs text-slate-600">
              Please let us know the reason for cancellation so we can improve our services.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Ordered by mistake, found better price, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-orange-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
