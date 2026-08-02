"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/admin/StatCard";
import { getAnalytics } from "@/lib/analyticsApi";
import { AnalyticsData } from "@/types";
import { ArrowLeft, TrendingUp, ShoppingBag, IndianRupee, Package } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#ca8a04"];

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch((err) => console.error("Failed to load analytics", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Admin Panel" />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="h-96 bg-white border border-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Format dates for chart display (e.g. "Jul 25" instead of "2026-07-25")
  const chartRevenueTrend = data.revenueTrend.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Panel" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Analytics</h1>

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Revenue"
            value={`₹${data.totalRevenue.toFixed(2)}`}
            icon={IndianRupee}
            color="green"
          />
          <StatCard label="Total Orders" value={data.totalOrders} icon={ShoppingBag} color="blue" />
          <StatCard
            label="Avg. Order Value"
            value={`₹${data.averageOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Revenue trend line chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartRevenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number) => [`₹${value.toFixed(2)}`, "Revenue"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category-wise sales pie chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Sales by Category</h2>
            {data.categorySales.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.categorySales}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(entry) => entry.category}
                    labelLine={false}
                  >
                    {data.categorySales.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top products bar chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Top 5 Selling Products</h2>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip formatter={(value: number) => [`${value} units`, "Sold"]} />
                  <Bar dataKey="unitsSold" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}