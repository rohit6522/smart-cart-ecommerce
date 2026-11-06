"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import { getOrderById } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { motion } from "framer-motion";
import CancelReturnModal from "@/components/user/CancelReturnModal";
import { cancelOrder, requestReturn } from "@/lib/orderApi";
import { XCircle, RotateCcw } from "lucide-react";
import {
  ArrowLeft,
  MapPin,
  Truck,
  Phone,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"];


function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.orderId);
  const [modalMode, setModalMode] = useState<"cancel" | "return" | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(`ORD-${order!.orderId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to fetch order", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reason: string) => {
    const updated = await cancelOrder(order!.orderId, reason);
    setOrder(updated);
  };

  const handleReturn = async (reason: string) => {
    const updated = await requestReturn(order!.orderId, reason);
    setOrder(updated);
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar title="Smart Cart" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full flex-1">
          <div className="h-64 bg-white border border-slate-200/80 rounded-3xl animate-pulse shadow-xs" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar title="Smart Cart" />
        <div className="max-w-2xl mx-auto px-6 py-12 text-center text-slate-500 font-medium">
          Order not found.
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <button
          onClick={() => router.push("/user/orders")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-semibold mb-4 transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Back to Orders
        </button>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 mb-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Order #{order.orderId}
              </h1>
              <button
                onClick={handleCopyOrderId}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}
              >
                {order.paymentStatus === "PAID"
                  ? "Paid Online"
                  : "Cash on Delivery"}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {!isCancelled && (
            <div className="flex items-center mt-7 mb-4 px-2">
              {STATUS_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        idx <= currentStepIndex ? "#2563eb" : "#f1f5f9",
                      scale: idx === currentStepIndex ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-2xs ${
                      idx <= currentStepIndex ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {idx <= currentStepIndex ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                          delay: 0.1,
                        }}
                      >
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      idx + 1
                    )}
                  </motion.div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-slate-100 relative overflow-hidden rounded-full">
                      <motion.div
                        initial={false}
                        animate={{
                          width: idx < currentStepIndex ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Delivery Info */}
          <div className="flex items-start gap-2.5 mt-6 text-sm text-slate-600 bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5">
            <MapPin size={18} className="mt-0.5 flex-shrink-0 text-slate-400" />
            <span className="leading-relaxed font-medium">{order.deliveryAddress}</span>
          </div>

          {order.deliveryBoyName && (
            <div className="flex items-center gap-2.5 mt-3 text-sm text-slate-600 bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5">
              <Truck size={18} className="flex-shrink-0 text-slate-400" />
              <span className="font-medium">Delivery Partner: <strong className="text-slate-800">{order.deliveryBoyName}</strong></span>
              {order.deliveryBoyPhone && (
                <a
                  href={`tel:${order.deliveryBoyPhone}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold ml-auto"
                >
                  <Phone size={14} /> {order.deliveryBoyPhone}
                </a>
              )}
            </div>
          )}
          {(order.canCancel || order.canReturn) && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 pt-5 border-t border-slate-100">
              {order.canCancel && (
                <button
                  onClick={() => setModalMode("cancel")}
                  className="flex items-center justify-center gap-1.5 text-sm text-rose-600 border border-rose-200 hover:bg-rose-50 px-5 py-2.5 rounded-xl font-semibold transition-all"
                >
                  <XCircle size={15} /> Cancel Order
                </button>
              )}
              {order.canReturn && (
                <button
                  onClick={() => setModalMode("return")}
                  className="flex items-center justify-center gap-1.5 text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 px-5 py-2.5 rounded-xl font-semibold transition-all"
                >
                  <RotateCcw size={15} /> Return Order
                </button>
              )}
            </div>
          )}

          {order.cancellationReason && (
            <div className="bg-rose-50 border border-rose-200/60 text-rose-700 text-sm px-4 py-2.5 rounded-xl mt-4 font-medium">
              <strong>Cancellation reason:</strong> {order.cancellationReason}
            </div>
          )}

          {order.returnReason && (
            <div className="bg-amber-50 border border-amber-200/60 text-amber-800 text-sm px-4 py-2.5 rounded-xl mt-4 font-medium">
              <strong>Return reason:</strong> {order.returnReason}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
          <h2 className="font-bold text-slate-900 text-lg tracking-tight mb-4">Items</h2>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <span className="font-semibold text-slate-900">{item.productName}</span>
                  <span className="text-slate-400 font-medium ml-2">× {item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-baseline font-bold text-slate-900 text-base">
            <span>Total</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <CancelReturnModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        mode={modalMode ?? "cancel"}
        onSubmit={modalMode === "cancel" ? handleCancel : handleReturn}
      />
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
