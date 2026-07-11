"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, ShoppingCart } from "lucide-react";

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <ShoppingCart className="text-blue-600" size={24} />
        <span className="font-bold text-lg text-gray-900">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Hi, <span className="font-medium text-gray-900">{user?.name}</span>
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}