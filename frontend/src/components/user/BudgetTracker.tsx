"use client";

import { CartResponse } from "@/types";
import { AlertTriangle, Wallet } from "lucide-react";

interface BudgetTrackerProps {
  cart: CartResponse | null;
  onSetBudget: (amount: number) => void;
}

export default function BudgetTracker({ cart, onSetBudget }: BudgetTrackerProps) {
  const totalBudget = cart?.totalBudget ?? 0;
  const currentSpent = cart?.currentSpent ?? 0;
  const percentageUsed = Math.min(cart?.percentageUsed ?? 0, 100);
  const overBudget = cart?.overBudget ?? false;

  const handleSetBudget = () => {
    const amount = prompt("Set your shopping budget (₹):", totalBudget.toString());
    if (amount && !isNaN(Number(amount))) {
      onSetBudget(Number(amount));
    }
  };

  const barColor = overBudget
    ? "bg-red-500"
    : percentageUsed > 80
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Budget Tracker</h3>
        </div>
        <button
          onClick={handleSetBudget}
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
  );
}