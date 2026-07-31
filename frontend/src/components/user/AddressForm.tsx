"use client";

import { useState } from "react";
import { Address, AddressPayload } from "@/types";
import { lookupPincode, getCurrentLocationAddress } from "@/lib/locationUtils";
import { LocateFixed } from "lucide-react";

interface AddressFormProps {
  initialData?: Address;
  onSubmit: (payload: AddressPayload) => Promise<void>;
  onCancel: () => void;
}

export default function AddressForm({ initialData, onSubmit, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<AddressPayload>({
    label: initialData?.label ?? "Home",
    fullName: initialData?.fullName ?? "",
    phone: initialData?.phone ?? "",
    street: initialData?.street ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
    zip: initialData?.zip ?? "",
    isDefault: initialData?.isDefault ?? false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePincodeBlur = async () => {
    if (form.zip.length !== 6 || !/^\d{6}$/.test(form.zip)) return;
    setPincodeLoading(true);
    try {
      const result = await lookupPincode(form.zip);
      if (result) {
        setForm((prev) => ({ ...prev, city: result.city, state: result.state }));
      }
    } catch {
      // silent fail, user can type manually
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setError("");
    try {
      const location = await getCurrentLocationAddress();
      setForm((prev) => ({
        ...prev,
        street: location.street || prev.street,
        city: location.city || prev.city,
        state: location.state || prev.state,
        zip: location.zip || prev.zip,
      }));
    } catch (err: any) {
      setError(err.message || "Could not fetch your current location");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim() || !form.phone.trim() || !form.street.trim() ||
        !form.city.trim() || !form.state.trim() || !form.zip.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>}

      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Label</label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locationLoading}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          <LocateFixed size={13} />
          {locationLoading ? "Locating..." : "Use Current Location"}
        </button>
      </div>
      <div className="flex gap-2">
        {["Home", "Work", "Other"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, label }))}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              form.label === label
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
        <input
          name="street"
          value={form.street}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ZIP {pincodeLoading && <span className="text-blue-500">...</span>}
          </label>
          <input
            name="zip"
            value={form.zip}
            onChange={handleChange}
            onBlur={handlePincodeBlur}
            maxLength={6}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
          className="accent-blue-600"
        />
        Set as default address
      </label>

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
          {saving ? "Saving..." : initialData ? "Update Address" : "Add Address"}
        </button>
      </div>
    </form>
  );
}