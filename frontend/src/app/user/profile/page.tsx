"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/user/ProfileSidebar";
import { getMyOrders } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Truck, Clock } from "lucide-react";
import Link from "next/link";
import { getMyReferralInfo } from "@/lib/authApi";
import { ReferralInfo } from "@/types";
import { Gift, Copy, Check } from "lucide-react";
import Toast from "@/components/ui/Toast";

function ProfileDashboardContent() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    getMyOrders()
      .then((data) => setOrders(data.slice().reverse()))
      .catch((err) => console.error("Failed to load orders", err))
      .finally(() => setLoading(false));

    getMyReferralInfo()
      .then(setReferral)
      .catch((err) => console.error("Failed to load referral info", err));
  }, []);

  const handleCopyCode = () => {
    if (!referral) return;
    navigator.clipboard.writeText(referral.referralCode);
    setCopied(true);
    setToastMsg("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const inTransit = orders.filter(
    (o) => o.status === "OUT_FOR_DELIVERY",
  ).length;
  const pending = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row gap-6 flex-1 w-full">
        <ProfileSidebar />

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-500 mb-6 text-sm">
            Track your orders and manage your account here.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl">
                <ShoppingBag className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  {loading ? "-" : orders.length}
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
                <Truck className="text-amber-600" size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Transit</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  {loading ? "-" : inTransit}
                </p>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl">
                <Clock className="text-indigo-600" size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  {loading ? "-" : pending}
                </p>
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg tracking-tight">Recent Orders</h3>
              <Link
                href="/user/orders"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ) : orders.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No orders yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.orderId}
                    href={`/user/orders/${order.orderId}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-3 px-3 rounded-xl transition-colors text-sm"
                  >
                    <span className="font-mono font-semibold text-slate-900">
                      #{order.orderId}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {referral && (
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-7 mt-6 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={20} />
                <h3 className="font-bold text-lg tracking-tight">Refer & Earn</h3>
              </div>
              <p className="text-sm text-indigo-100 mb-4 max-w-lg leading-relaxed">
                Share your code with friends. You both get ₹100 off on your next
                order (min. ₹300)!
              </p>
              <div className="flex items-center gap-3 bg-white/15 border border-white/20 rounded-2xl p-3 sm:p-3.5 backdrop-blur-xs max-w-md">
                <span className="flex-1 font-mono font-bold tracking-wider text-base sm:text-lg">
                  {referral.referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-white text-indigo-900 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <p className="text-xs text-indigo-200 mt-3 font-medium">
                👥 {referral.totalReferred} friend
                {referral.totalReferred !== 1 ? "s" : ""} joined using your code
              </p>
            </div>
          )}
        </div>
      </div>
      <Toast message={toastMsg} />
    </div>
  );
}

export default function ProfileDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <ProfileDashboardContent />
    </ProtectedRoute>
  );
}
