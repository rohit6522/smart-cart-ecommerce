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
    ? "bg-gradient-to-r from-rose-500 to-red-600 animate-pulse"
    : percentageUsed > 80
    ? "bg-gradient-to-r from-amber-500 to-orange-500"
    : "bg-gradient-to-r from-emerald-500 to-teal-500";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/80 hover:shadow-md transition-all duration-200 p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Wallet size={18} />
            </div>
            <h3 className="font-bold text-slate-900 tracking-tight">Budget Tracker</h3>
          </div>
          <button
            onClick={openModal}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all"
          >
            {totalBudget > 0 ? "Edit Budget" : "Set Budget"}
          </button>
        </div>

        {totalBudget === 0 ? (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            You haven&apos;t set a budget yet. Click &quot;Set Budget&quot; to start tracking your spending in real time.
          </p>
        ) : (
          <>
            <div className="flex justify-between text-xs sm:text-sm mb-1.5">
              <span className="text-slate-600 font-medium">
                ₹{currentSpent.toFixed(2)} spent of ₹{totalBudget.toFixed(2)}
              </span>
              <span className={`font-bold ${overBudget ? "text-rose-600" : "text-slate-800"}`}>
                {percentageUsed.toFixed(0)}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100/90 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>

            {overBudget ? (
              <div className="flex items-center gap-2 mt-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs sm:text-sm font-semibold p-3 rounded-xl">
                <AlertTriangle size={17} className="flex-shrink-0 text-rose-600" />
                <span>
                  You&apos;ve exceeded your budget by ₹{Math.abs(cart!.remainingBudget).toFixed(2)}
                </span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-3">
                <span className="font-bold text-emerald-600">₹{cart?.remainingBudget.toFixed(2)}</span> remaining in your budget
              </p>
            )}
          </>
        )}
      </div>

      {/* Custom Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900 tracking-tight">Set Shopping Budget</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-base sm:text-lg text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />

              {error && <p className="text-rose-600 text-xs sm:text-sm font-medium mt-2">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold shadow-sm hover:shadow-md active:scale-95 transition-all"
                >
                  Save Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}