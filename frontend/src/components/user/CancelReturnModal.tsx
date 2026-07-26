"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface CancelReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "cancel" | "return";
  onSubmit: (reason: string) => Promise<void>;
}

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery is taking too long",
  "Changed my mind",
  "Other",
];

const RETURN_REASONS = [
  "Product damaged or defective",
  "Wrong item delivered",
  "Product doesn't match description",
  "No longer needed",
  "Other",
];

export default function CancelReturnModal({ isOpen, onClose, mode, onSubmit }: CancelReturnModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reasons = mode === "cancel" ? CANCEL_REASONS : RETURN_REASONS;

  const handleSubmit = async () => {
    const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!finalReason) {
      setError("Please select or enter a reason");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(finalReason);
      setSelectedReason("");
      setCustomReason("");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "cancel" ? "Cancel Order" : "Return Order"}
    >
      <p className="text-sm text-gray-500 mb-4">
        {mode === "cancel"
          ? "Please tell us why you're cancelling this order."
          : "Returns are accepted within 7 days of delivery. Please tell us the reason."}
      </p>

      <div className="space-y-2 mb-4">
        {reasons.map((reason) => (
          <label
            key={reason}
            className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
              selectedReason === reason ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="reason"
              checked={selectedReason === reason}
              onChange={() => setSelectedReason(reason)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-800">{reason}</span>
          </label>
        ))}
      </div>

      {selectedReason === "Other" && (
        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Please specify..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
        >
          Go Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {submitting ? "Submitting..." : mode === "cancel" ? "Confirm Cancellation" : "Submit Return"}
        </button>
      </div>
    </Modal>
  );
}