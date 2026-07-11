"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/user/ProfileSidebar";
import { useAuth } from "@/context/AuthContext";

function ProfileInfoContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-6">
        <ProfileSidebar />
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Profile Info</h1>
          <div className="space-y-4 max-w-md">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Editing profile info coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfileInfoPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <ProfileInfoContent />
    </ProtectedRoute>
  );
}