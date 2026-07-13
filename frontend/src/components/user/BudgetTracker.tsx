"use client";

import { useState } from "react";
import { CartResponse } from "@/types";
import { AlertTriangle, Wallet, X } from "lucide-react";

interface BudgetTrackerProps {
  cart: CartResponse | null;
  onSetBudget: (amount: number) => void;
}

export default function BudgetTracker({ cart, onSetBudget }: BudgetTrackerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const totalBudget = cart?.totalBudget ?? 0;
  const currentSpent = cart?.currentSpent ?? 0;
  const percentageUsed = Math.min(cart?.percentageUsed ?? 0, 100);
  const overBudget = cart?.overBudget ?? false;

  const openModal = () => {
    setInputValue(totalBudget > 0 ? totalBudget.toString() : "");
    setError("");
    setModalOpen(true);
  };

  const handleSave = () => {
    const amount = Number(inputValue);
    if (!inputValue.trim() || isNaN(amount) || amount < 0) {
      setError("Please enter a valid amount");
      return;
    }
    onSetBudget(amount);
    setModalOpen(false);
  };

  const barColor = overBudget
    ? "bg-red-500"
    : percentageUsed > 80
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Budget Tracker</h3>
          </div>
          <button
            onClick={openModal}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            {totalBudget > 0 ? "Edit Budget" : "Set Budget"}
          </button>
        </div>

        {totalBudget === 0 ? (
          <p className="text-sm text-gray-500">
            You haven&apos;t set a budget yet. Click &quot;Set Budget&quot; to start tracking.
          </p>
        ) : (
          <>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">
                ₹{currentSpent.toFixed(2)} spent of ₹{totalBudget.toFixed(2)}
              </span>
              <span className={`font-medium ${overBudget ? "text-red-600" : "text-gray-700"}`}>
                {percentageUsed.toFixed(0)}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} transition-all duration-300`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>

            {overBudget ? (
              <div className="flex items-center gap-1.5 mt-3 text-red-600 text-sm font-medium">
                <AlertTriangle size={16} />
                You&apos;ve exceeded your budget by ₹
                {Math.abs(cart!.remainingBudget).toFixed(2)}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-3">
                ₹{cart?.remainingBudget.toFixed(2)} remaining
              </p>
            )}
          </>
        )}
      </div>

      {/* Custom Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-900">Set Shopping Budget</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Amount (₹)
              </label>
              <input
                type="number"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. 10000"
                min={0}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}