"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Modal from "@/components/ui/Modal";
import CouponForm from "@/components/admin/CouponForm";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/lib/couponApi";
import { Coupon, CouponFormPayload } from "@/types";
import { ArrowLeft, Plus, Pencil, Trash2, Tag, Users } from "lucide-react";

function AdminCouponsContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const router = useRouter();

  const fetchCoupons = () => {
    getAllCoupons()
      .then(setCoupons)
      .catch((err) => console.error("Failed to load coupons", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: CouponFormPayload) => {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, payload);
    } else {
      await createCoupon(payload);
    }
    setModalOpen(false);
    fetchCoupons();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Panel" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm"
          >
            <Plus size={16} /> Create Coupon
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 skeleton-shimmer rounded-xl" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Tag className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-sm text-gray-500">No coupons created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`bg-white border rounded-xl p-4 ${
                  coupon.active ? "border-gray-200" : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-blue-700 text-lg">{coupon.code}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      coupon.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}% off`
                      : `₹${coupon.discountValue} off`}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    Min. ₹{coupon.minOrderValue}
                  </span>
                  {coupon.firstOrderOnly && (
                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users size={11} /> First order only
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(coupon)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? "Edit Coupon" : "Create New Coupon"}
      >
        <CouponForm
          initialData={editingCoupon ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminCouponsContent />
    </ProtectedRoute>
  );
}