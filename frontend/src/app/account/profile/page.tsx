"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Check, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [budgetLimit, setBudgetLimit] = useState(user?.budgetLimit || 0);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");

    // Simulate API update
    setTimeout(() => {
      updateUser({ name, phone, budgetLimit: Number(budgetLimit) });
      setSaving(false);
      setSuccessMessage("Your profile information has been updated successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Personal Profile</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your account credentials and personal preferences
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address (Immutable)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Monthly Budget Limit (₹)
            </label>
            <input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              placeholder="e.g. 25000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
            />
            <p className="text-[11px] text-slate-600 mt-1">
              Optional budget tracker to alert you when your lifetime monthly shopping exceeds this threshold.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving Changes..." : "Save Profile Details"}
        </button>
      </form>
    </div>
  );
}
