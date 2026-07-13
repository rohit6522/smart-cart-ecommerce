"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CheckoutStepper from "@/components/user/CheckoutStepper";
import { getOrderById } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { PartyPopper, Truck, CreditCard, Calendar, Package, ShoppingBag } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = Number(searchParams.get("orderId"));

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/user");
      return;
    }
    getOrderById(orderId)
      .then(setOrder)
      .catch((err) => console.error("Failed to load order", err))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="h-96 bg-white border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Estimated delivery: 3 days from order creation, purely cosmetic
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.06;

  const paymentLabel = order.paymentStatus === "PAID" ? "Paid Online" : "Cash on Delivery";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <CheckoutStepper currentStep={3} />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="text-green-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed!</h1>
          <p className="text-gray-500">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="text-blue-600 font-medium mt-2">Order ID: #ORD-{order.orderId}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {/* Shipping Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={18} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Shipping Information</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{order.deliveryAddress}</p>

            <div className="bg-blue-50 rounded-lg px-3 py-2.5 mt-4 flex items-center gap-2">
              <Calendar size={15} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Estimated Delivery</p>
                <p className="text-sm font-medium text-blue-700">
                  {estimatedDelivery.toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">Payment Details</h3>
            </div>

            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900">{paymentLabel}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-500">Payment Status</span>
              <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {order.paymentStatus === "PAID" ? "Paid" : "Pending (COD)"}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span className="text-gray-900 font-medium">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Paid</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(`/user/orders/${order.orderId}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          >
            <Package size={17} /> Track Your Order
          </button>
          <button
            onClick={() => router.push("/user")}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition"
          >
            <ShoppingBag size={17} /> Continue Shopping
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          A confirmation has been sent to your registered email with billing details.
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <OrderSuccessContent />
    </ProtectedRoute>
  );
}