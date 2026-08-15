"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfilePhoto } from "@/lib/authApi";
import { Camera, Loader2 } from "lucide-react";

export default function ProfilePhotoUpload() {
  const { user, updatePhoto } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB");
      return;
    }

    setError("");
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await updateProfilePhoto(base64);
        updatePhoto(base64);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to upload photo");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the image file");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl overflow-hidden border-4 border-white shadow-sm">
          {user?.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin text-blue-600" />
          ) : (
            <Camera size={14} className="text-gray-600" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}