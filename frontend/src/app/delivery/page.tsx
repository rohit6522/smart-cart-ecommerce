"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import DeliveryCard from "@/components/delivery/DeliveryCard";
import { getMyDeliveries, updateDeliveryStatus } from "@/lib/deliveryApi";
import { DeliveryAssignment, DeliveryStatus } from "@/types";
import { Truck, PackageCheck, Clock } from "lucide-react";

function DeliveryDashboardContent() {
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const fetchDeliveries = async () => {
    try {
      const data = await getMyDeliveries();
      setDeliveries(data);
    } catch (err) {
      console.error("Failed to load deliveries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (assignmentId: number, status: DeliveryStatus) => {
    await updateDeliveryStatus(assignmentId, status);
    fetchDeliveries();
  };

  const activeDeliveries = useMemo(
    () => deliveries.filter((d) => d.status !== "DELIVERED"),
    [deliveries]
  );
  const completedDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === "DELIVERED"),
    [deliveries]
  );

  const visibleDeliveries = filter === "ACTIVE" ? activeDeliveries : completedDeliveries;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Delivery Panel" />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Deliveries</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-yellow-50 p-2.5 rounded-xl">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-lg font-bold text-gray-900">{activeDeliveries.length}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <PackageCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-lg font-bold text-gray-900">{completedDeliveries.length}</p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "ACTIVE"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "COMPLETED"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : visibleDeliveries.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Truck className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">
              {filter === "ACTIVE" ? "No active deliveries right now." : "No completed deliveries yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.assignmentId}
                delivery={delivery}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  return (
    <ProtectedRoute allowedRoles={["DELIVERY_BOY"]}>
      <DeliveryDashboardContent />
    </ProtectedRoute>
  );
}