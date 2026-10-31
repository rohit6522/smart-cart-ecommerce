"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, ShoppingCart, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const errorReason = searchParams.get("error");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Payment Could Not Be Completed
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Your bank or payment gateway declined the transaction or the session expired. No funds were permanently deducted.
            </p>
            {errorReason && (
              <p className="text-xs font-mono bg-red-50 text-red-600 p-2 rounded-lg">
                Reason: {errorReason}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/checkout"
              className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Try Again with Different Method
            </Link>

            <Link
              href="/cart"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" /> Return to Cart
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading status...</div>}>
      <FailedContent />
    </Suspense>
  );
}
