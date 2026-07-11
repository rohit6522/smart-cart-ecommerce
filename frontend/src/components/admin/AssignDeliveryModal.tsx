"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { getAllDeliveryBoys, assignDelivery } from "@/lib/deliveryApi";
import { DeliveryBoy } from "@/types";
import { Truck } from "lucide-react";

interface AssignDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  onAssigned: () => void;
}

export default function AssignDeliveryModal({
  isOpen,
  onClose,
  orderId,
  onAssigned,
}: AssignDeliveryModalProps) {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSelectedId(null);
      setLoading(true);
      getAllDeliveryBoys()
        .then(setDeliveryBoys)
        .catch((err) => console.error("Failed to load delivery boys", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!orderId || !selectedId) {
      setError("Please select a delivery partner");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      await assignDelivery(orderId, selectedId);
      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to assign delivery");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Delivery Partner">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : deliveryBoys.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No delivery partners registered yet. Ask a delivery partner to register with the
          &quot;Delivery Partner&quot; role.
        </p>
      ) : (
        <div className="space-y-2 mb-5">
          {deliveryBoys.map((boy) => (
            <button
              key={boy.id}
              onClick={() => setSelectedId(boy.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                selectedId === boy.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="bg-purple-50 p-2 rounded-lg">
                <Truck size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{boy.name}</p>
                <p className="text-xs text-gray-500">{boy.phone || boy.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {deliveryBoys.length > 0 && (
        <button
          onClick={handleAssign}
          disabled={assigning || !selectedId}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {assigning ? "Assigning..." : "Assign"}
        </button>
      )}
    </Modal>
  );
}