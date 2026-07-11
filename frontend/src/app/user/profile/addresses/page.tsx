"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/user/ProfileSidebar";
import { MapPin } from "lucide-react";

function AddressesContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-6">
        <ProfileSidebar />
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Saved Addresses</h1>
          <div className="text-center py-12 text-gray-400">
            <MapPin className="mx-auto mb-3" size={32} />
            <p className="text-sm">
              You don&apos;t have any saved addresses yet. You&apos;ll enter your delivery
              address at checkout each time for now — saved address management is coming soon.
            </p>
          </div>
        </div>
      </div>
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