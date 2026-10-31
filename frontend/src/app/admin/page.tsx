"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  Tag,
  Star,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMetrics(data.metrics || {});
          setChartData(data.chartData || []);
          setLowStockProducts(data.lowStockProducts || []);
          setRecentOrders(data.recentOrders || []);
        }
      })
      .catch((err) => console.error("Analytics fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Real-time business performance, revenue trends, and operational inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Sales */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last week
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalOrders}
          </div>
          <p className="text-[11px] text-slate-600">Processed across all channels</p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{metrics.averageOrderValue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-600">Per paying transaction</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Registered Customers
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalCustomers}
          </div>
          <p className="text-[11px] text-slate-600">Active shopping accounts</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              7-Day Revenue Trends
            </h2>
            <p className="text-xs text-slate-600">
              Daily confirmed sales volume across all categories
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ea580c"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Low Stock Alert + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Low Stock (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Warnings
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              All Inventory →
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">
              All product lines are comfortably stocked!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockProducts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] font-mono text-slate-600">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                      {p.stock} units left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Customer Orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-600 py-4 text-center">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </span>
                    <p className="text-[11px] text-slate-600">
                      Customer: {ord.user?.name || ord.shippingAddress?.fullName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">
                      ₹{ord.totalPrice?.toLocaleString("en-IN")}
                    </p>
                    <span className="text-[10px] font-bold uppercase text-orange-600">
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
