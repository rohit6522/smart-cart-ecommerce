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

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleSetDefault = async (id: number) => {
    const previousAddresses = addresses;

    // Optimistic update - reflect the change instantly in UI
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    setUpdatingId(id);

    try {
      await setDefaultAddress(id);
    } catch (err) {
      console.error("Failed to set default", err);
      // Revert on failure
      setAddresses(previousAddresses);
    } finally {
      setUpdatingId(null);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white border-2 rounded-xl p-5 transition ${
                    addr.isDefault
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-gray-200"
                  }`}
                >
                  {/* Radio-style default selector at the top */}
                  <button
                    onClick={() => !addr.isDefault && handleSetDefault(addr.id)}
                    disabled={addr.isDefault || updatingId === addr.id}
                    className="flex items-center gap-2 mb-3 w-full text-left disabled:cursor-default"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        addr.isDefault ? "border-blue-600" : "border-gray-300"
                      }`}
                    >
                      {addr.isDefault && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </span>
                    <span
                      className={`text-xs font-medium ${addr.isDefault ? "text-blue-700" : "text-gray-500"}`}
                    >
                      {updatingId === addr.id
                        ? "Updating..."
                        : addr.isDefault
                          ? "Default delivery address"
                          : "Set as default"}
                    </span>
                  </button>

                  <div className="pl-6 space-y-2.5">
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {addr.label}
                    </span>

                    <p className="font-semibold text-gray-900 text-sm">
                      {addr.fullName}
                    </p>

                    <p className="text-sm text-gray-500 leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>

                    <p className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone size={13} /> {addr.phone}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 pl-6">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-medium"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium ml-auto"
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
