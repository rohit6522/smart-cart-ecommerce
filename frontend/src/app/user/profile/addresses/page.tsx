"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/user/ProfileSidebar";
import Modal from "@/components/ui/Modal";
import AddressForm from "@/components/user/AddressForm";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/addressApi";
import { Address, AddressPayload } from "@/types";
import { MapPin, Plus, Pencil, Trash2, Star, Phone } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = () => {
    getMyAddresses()
      .then(setAddresses)
      .catch((err) => console.error("Failed to load addresses", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: AddressPayload) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, payload);
    } else {
      await addAddress(payload);
    }
    setModalOpen(false);
    fetchAddresses();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error("Failed to set default", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-6">
        <ProfileSidebar />
        <div className="flex-1">
          <BackButton href="/user/profile" label="Back to Profile" />
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-6">
              Saved Addresses
            </h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-white border border-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
              <MapPin className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-sm text-gray-500">
                No saved addresses yet. Add one to speed up checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white border rounded-xl p-4 relative ${
                    addr.isDefault ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      <Star size={11} className="fill-blue-700" /> Default
                    </span>
                  )}
                  <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium mb-2">
                    {addr.label}
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {addr.fullName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {addr.street}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Phone size={12} /> {addr.phone}
                  </p>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(addr)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 ml-auto"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      >
        <AddressForm
          initialData={editingAddress ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <AddressesContent />
    </ProtectedRoute>
  );
}
