"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import { getOrderById } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { ArrowLeft, MapPin, Truck, Phone, CheckCircle2 } from "lucide-react";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"];

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.orderId);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-2xl mx-auto px-6 py-8 text-center text-gray-500">
          Order not found.
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/user/orders")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.orderId}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {order.paymentStatus === "PAID"
                  ? "Paid Online"
                  : "Cash on Delivery"}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Status Tracker */}
          {!isCancelled && (
            <div className="flex items-center mt-6 mb-2">
              {STATUS_STEPS.map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      idx <= currentStepIndex
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx <= currentStepIndex ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        idx < currentStepIndex ? "bg-blue-600" : "bg-gray-100"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Delivery Info */}
          <div className="flex items-start gap-2 mt-5 text-sm text-gray-600">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span>{order.deliveryAddress}</span>
          </div>

          {order.deliveryBoyName && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <Truck size={16} className="flex-shrink-0" />
              <span>Delivery Partner: {order.deliveryBoyName}</span>
              {order.deliveryBoyPhone && (
                <a
                  href={`tel:${order.deliveryBoyPhone}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline ml-2"
                >
                  <Phone size={14} /> {order.deliveryBoyPhone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="text-gray-900">{item.productName}</span>
                  <span className="text-gray-400 ml-2">× {item.quantity}</span>
                </div>
                <span className="font-medium text-gray-900">
                  ₹{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
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
