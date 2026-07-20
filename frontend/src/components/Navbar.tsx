"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ShoppingCart, ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  title: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ title, onSearch }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchFocus = () => {
    // If a page doesn't handle search itself, typing redirects to the shopping home
    if (!onSearch && pathname !== "/user" && pathname !== "/") {
      router.push("/user");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <ShoppingCart className="text-blue-600" size={24} />
        <span className="font-bold text-lg text-gray-900 hidden sm:inline">{title}</span>
      </Link>

      {/* Search bar - always visible in navbar, Flipkart-style */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          placeholder="Search for products, brands and more..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Guest state */}
        {!user && (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Sign Up
            </Link>
          </>
        )}

        {/* Logged-in USER */}
        {user?.role === "USER" && (
          <>
            <Link
              href="/user/cart"
              className={`p-2 rounded-lg transition ${
                pathname === "/user/cart" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"
              }`}
              title="Cart"
            >
              <ShoppingBag size={20} />
            </Link>
            <Link
              href="/user/profile"
              className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                pathname === "/user/profile"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
              title="Profile"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
          </>
        )}

        {/* Logged-in ADMIN / DELIVERY_BOY */}
        {user && user.role !== "USER" && (
          <span className="text-sm text-gray-600 hidden sm:inline">
            Hi, <span className="font-medium text-gray-900">{user.name}</span>
          </span>
        )}

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}