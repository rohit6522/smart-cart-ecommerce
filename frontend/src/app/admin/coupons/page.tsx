"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Check, Clock, Percent } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "20",
    minOrderAmount: "999",
    maxDiscountAmount: "500",
    firstOrderOnly: false,
    isActive: true,
  });

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setModalOpen(false);
        loadCoupons();
        setForm({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: "20",
          minOrderAmount: "999",
          maxDiscountAmount: "500",
          firstOrderOnly: false,
          isActive: true,
        });
      }
    } catch {
      // Ignore
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Coupons &amp; Deals</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Create promotional codes and discount quotas for checkout
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))
        ) : coupons.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100">
            No active coupons found.
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-base font-black tracking-wider text-slate-900 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 inline-block">
                    {c.code}
                  </span>
                  <p className="text-xs text-slate-600 mt-2">{c.description}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span>Discount Value</span>
                  <span className="font-bold">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}% OFF`
                      : `₹${c.discountValue} FLAT`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Min Order Required</span>
                  <span className="font-bold">₹{c.minOrderAmount}</span>
                </div>
                {c.firstOrderOnly && (
                  <div className="text-[10px] font-bold text-orange-600 pt-1">
                    ★ First-time shoppers only
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-600 flex justify-between pt-2 border-t border-slate-100">
                <span>Usage count: {c.usedCount || 0}</span>
                <span>Limit: {c.usageLimit || 1000}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Create Promotion Code</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="25% off on all autumn collections"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.firstOrderOnly}
                    onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold text-slate-800">First-time orders only</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500"
                >
                  {creating ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
