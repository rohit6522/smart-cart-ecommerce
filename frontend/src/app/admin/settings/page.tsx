"use client";

import { useState } from "react";
import { Settings, Save, ShieldCheck, Database, Key, Check } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("CARTNOVA (TROSTO)");
  const [supportEmail, setSupportEmail] = useState("support@cartnova.com");
  const [currency, setCurrency] = useState("INR (₹)");
  const [shippingThreshold, setShippingThreshold] = useState("999");
  const [shippingFee, setShippingFee] = useState("99");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Configure business rules, shipping rates, and third-party integrations
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Platform preferences saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Store Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Brand Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Contact Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Shipping Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={shippingThreshold}
                onChange={(e) => setShippingThreshold(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-600 mt-1">
                Orders with subtotal at or above this amount receive free delivery.
              </p>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-600 mt-1">
                Flat shipping fee applied on orders under the threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Database & Integrations Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Infrastructure Health</h3>
          <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-slate-700">
            <p className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Engine: <strong>MongoDB Atlas (Mongoose ODM)</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-600" />
              <span>Payment Gateway: <strong>Razorpay (Active Test Mode)</strong></span>
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Authentication: <strong>JWT + HTTP-Only Secure Cookies</strong></span>
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
