"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, ShoppingCart, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <Link href="/user" className="flex items-center gap-2">
        <ShoppingCart className="text-blue-600" size={24} />
        <span className="font-bold text-lg text-gray-900">{title}</span>
      </Link>

      <div className="flex items-center gap-3">
        {user?.role === "USER" && (
          <Link
            href="/user/cart"
            className={`p-2 rounded-lg transition ${
              pathname === "/user/cart" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"
            }`}
            title="Cart"
          >
            <ShoppingBag size={20} />
          </Link>
        )}

        {user?.role === "USER" && (
          <Link
            href="/user/profile"
            className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition ${
              pathname === "/user/profile"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="Profile"
          >
            {user?.name?.charAt(0).toUpperCase() ?? <User size={16} />}
          </Link>
        )}

        {user?.role !== "USER" && (
          <span className="text-sm text-gray-600">
            Hi, <span className="font-medium text-gray-900">{user?.name}</span>
          </span>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}