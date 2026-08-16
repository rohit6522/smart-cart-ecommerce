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

  const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300; // resize to max 300x300 for a profile avatar

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress as JPEG at 70% quality - keeps file size small
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Image must be under 5MB");
    return;
  }

  setError("");
  setUploading(true);

  try {
    const compressedBase64 = await compressImage(file);
    await updateProfilePhoto(compressedBase64);
    updatePhoto(compressedBase64);
  } catch (err: any) {
    setError(err?.response?.data?.message || "Failed to upload photo");
  } finally {
    setUploading(false);
  }
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