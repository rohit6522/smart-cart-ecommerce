"use client";

import { useState } from "react";
import { Coupon, CouponFormPayload } from "@/types";

interface CouponFormProps {
  initialData?: Coupon;
  onSubmit: (payload: CouponFormPayload) => Promise<void>;
  onCancel: () => void;
}

export default function CouponForm({ initialData, onSubmit, onCancel }: CouponFormProps) {
  const [form, setForm] = useState<CouponFormPayload>({
    code: initialData?.code ?? "",
    description: initialData?.description ?? "",
    discountType: initialData?.discountType ?? "PERCENTAGE",
    discountValue: initialData?.discountValue ?? 0,
    minOrderValue: initialData?.minOrderValue ?? 0,
    firstOrderOnly: initialData?.firstOrderOnly ?? false,
    active: initialData?.active ?? true,
    expiresAt: initialData?.expiresAt ?? null,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.code.trim() || form.discountValue <= 0) {
      setError("Please fill all required fields with valid values");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="e.g. SAVE20"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Get 20% off on your order"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENTAGE" | "FLAT" })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat Amount (₹)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Value {form.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
          </label>
          <input
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value (₹)</label>
        <input
          type="number"
          value={form.minOrderValue}
          onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
          min={0}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.firstOrderOnly}
            onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })}
            className="accent-blue-600"
          />
          First order only
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-blue-600"
          />
          Active
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : initialData ? "Update Coupon" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}