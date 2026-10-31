"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, Home, ShieldCheck, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const paymentId = searchParams.get("paymentId");
  const method = searchParams.get("method");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.order) setOrder(data.order);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Payment Confirmed
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your order has been placed and is currently being processed by our warehouse team.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto text-left space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Order Reference:</span>
              <span className="font-mono font-bold text-slate-900">
                {orderNumber || order?.orderNumber || "TN-PENDING"}
              </span>
            </div>
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-slate-600">Razorpay Payment ID:</span>
                <span className="font-mono text-slate-700">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Payment Mode:</span>
              <span className="font-bold text-slate-900">
                {method === "COD" ? "Cash on Delivery" : "Prepaid via Razorpay"}
              </span>
            </div>
            {order && (
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold">
                <span className="text-slate-900">Amount Paid:</span>
                <span className="text-orange-600">₹{order.totalPrice?.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {orderId && (
              <Link
                href={`/account/orders/${orderId}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Package className="w-4 h-4" /> Track Order Status
              </Link>
            )}

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Verifying order status...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
