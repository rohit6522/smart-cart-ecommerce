"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Check, Home, Building } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>(
    user && (user as any).addresses?.length > 0
      ? (user as any).addresses
      : [
          {
            _id: "addr_1",
            fullName: user?.name || "Rahul Sharma",
            phone: user?.phone || "+91 9876543210",
            street: "Flat 402, Green Glen Layout, Bellandur",
            city: "Bengaluru",
            state: "Karnataka",
            postalCode: "560103",
            country: "India",
            isDefault: true,
            label: "Home",
          },
        ]
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    label: "Home",
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const created = {
      ...newAddr,
      _id: "addr_" + Date.now(),
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, created]);
    setModalOpen(false);
    setNewAddr({
      fullName: user?.name || "",
      phone: user?.phone || "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      label: "Home",
    });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a._id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a._id === id,
      }))
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Delivery Addresses</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage your saved delivery locations for swift 1-click checkout
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              addr.isDefault
                ? "border-orange-500 bg-orange-50/20 shadow-xs"
                : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
            }`}
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  {addr.label === "Home" ? (
                    <Home className="w-3.5 h-3.5 text-orange-500" />
                  ) : (
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {addr.label}
                </span>

                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                    Default
                  </span>
                )}
              </div>

              <p className="font-bold text-slate-900">{addr.fullName}</p>
              <p className="text-slate-600">{addr.street}</p>
              <p className="text-slate-600">
                {addr.city}, {addr.state} - {addr.postalCode}
              </p>
              <p className="text-slate-600 font-medium">Phone: {addr.phone}</p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              {!addr.isDefault ? (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr._id)}
                  className="font-bold text-orange-600 hover:underline"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-slate-600 text-[11px]">Primary delivery address</span>
              )}

              <button
                type="button"
                onClick={() => handleDeleteAddress(addr._id)}
                className="text-slate-600 hover:text-red-500 p-1"
                title="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Add New Delivery Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address Label</label>
                  <select
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-500"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
