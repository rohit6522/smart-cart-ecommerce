

"use client";

import { useState } from "react";
import { DeliveryAssignment, DeliveryStatus } from "@/types";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import { MapPin, Phone, IndianRupee, ArrowRight } from "lucide-react";

interface DeliveryCardProps {
  delivery: DeliveryAssignment;
  onUpdateStatus: (assignmentId: number, status: DeliveryStatus) => Promise<void>;
}

// Defines the forward-only progression a delivery boy can move through
const NEXT_STATUS: Record<DeliveryStatus, DeliveryStatus | null> = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "DELIVERED",
  DELIVERED: null,
};

const NEXT_LABEL: Record<DeliveryStatus, string> = {
  ASSIGNED: "Mark as Picked Up",
  PICKED_UP: "Mark as Delivered",
  DELIVERED: "Completed",
};

export default function DeliveryCard({ delivery, onUpdateStatus }: DeliveryCardProps) {
  const [updating, setUpdating] = useState(false);
  const nextStatus = NEXT_STATUS[delivery.status];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(delivery.assignmentId, nextStatus);
    } catch (err) {
      console.error("Failed to update delivery status", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900">Order #{delivery.orderId}</span>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 flex-shrink-0" />
          <span>{delivery.deliveryAddress}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={15} className="flex-shrink-0" />
          <span>{delivery.customerName}</span>
          {delivery.customerPhone && (
            
             <a href={`tel:${delivery.customerPhone}`}
              className="text-blue-600 hover:underline ml-1"
            >
              {delivery.customerPhone}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee size={15} className="flex-shrink-0" />
          <span className="font-medium text-gray-900">₹{delivery.orderTotal.toFixed(2)}</span>
        </div>
      </div>

      {nextStatus ? (
        <button
          onClick={handleAdvance}
          disabled={updating}
          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {updating ? "Updating..." : NEXT_LABEL[delivery.status]}
          {!updating && <ArrowRight size={14} />}
        </button>
      ) : (
        <div className="w-full text-center bg-green-50 text-green-700 py-2.5 rounded-lg font-medium text-sm">
          ✓ Delivered
        </div>
      )}
    </div>
  );
}