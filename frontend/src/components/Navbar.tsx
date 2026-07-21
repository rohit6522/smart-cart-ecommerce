"use client";

import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchFocus = () => {
    if (!onSearch && pathname !== "/user" && pathname !== "/") {
      router.push("/user");
    }
  };

  return (
    <div className="sticky top-0 z-20 px-0 sm:px-4 pt-0 sm:pt-3 transition-all duration-300">
      <nav
        className={`bg-white border-gray-200 mx-auto transition-all duration-300 ease-in-out ${
          scrolled
            ? "max-w-5xl rounded-full shadow-lg border mt-2"
            : "max-w-6xl rounded-none shadow-none border-b mt-0"
        }`}
      >
        <div
          className={`mx-auto flex items-center gap-6 transition-all duration-300 ${
            scrolled ? "px-6 py-2.5" : "px-6 py-3"
          }`}
        >
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <ShoppingCart className="text-blue-600" size={22} />
            <span className="font-bold text-lg text-gray-900 hidden sm:inline whitespace-nowrap">
              {title}
            </span>
          </Link>

          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}

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
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 transition ${
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

            {user && user.role !== "USER" && (
              <span className="text-sm text-gray-600 hidden sm:inline whitespace-nowrap">
                Hi, <span className="font-medium text-gray-900">{user.name}</span>
              </span>
            )}

            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}