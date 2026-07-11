"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/admin/StatCard";
import { getAllProducts } from "@/lib/productApi";
import { getAllOrders } from "@/lib/orderApi";
import { Product, OrderResponse } from "@/types";
import { Package, ShoppingBag, IndianRupee, Clock } from "lucide-react";
import Link from "next/link";

function AdminDashboardContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProducts(), getAllOrders()])
      .then(([productsData, ordersData]) => {
        setProducts(productsData);
        setOrders(ordersData);
      })
      .catch((err) => console.error("Failed to load dashboard data", err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Panel" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white border border-gray-200 rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              <StatCard label="Total Products" value={products.length} icon={Package} color="blue" />
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="purple" />
              <StatCard
                label="Total Revenue"
                value={`₹${totalRevenue.toFixed(2)}`}
                icon={IndianRupee}
                color="green"
              />
              <StatCard label="Pending Orders" value={pendingOrders} icon={Clock} color="yellow" />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/admin/products"
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col items-start gap-3"
          >
            <div className="bg-blue-50 p-3 rounded-xl">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Products</h3>
              <p className="text-sm text-gray-500">Add, edit, or remove products</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition flex flex-col items-start gap-3"
          >
            <div className="bg-purple-50 p-3 rounded-xl">
              <ShoppingBag className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Orders</h3>
              <p className="text-sm text-gray-500">View orders and assign delivery</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="h-20 bg-gray-50 rounded-lg animate-pulse" />
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {orders
                .slice()
                .reverse()
                .slice(0, 5)
                .map((order) => (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm"
                  >
                    <span className="text-gray-900 font-medium">Order #{order.orderId}</span>
                    <span className="text-gray-500">{order.status}</span>
                    <span className="font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}