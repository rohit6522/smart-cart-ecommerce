"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, ShoppingCart, ShoppingBag, Search, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SearchSuggestions from "./user/SearchSuggestions";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useNotifications } from "@/context/NotificationContext";
import NotificationBell from "./user/NotificationBell";

interface NavbarProps {
  title: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ title, onSearch }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { itemCount, refreshCartCount } = useCart();
  const { refreshWishlist } = useWishlist();
  const { refreshUnreadCount } = useNotifications();

  useEffect(() => {
    if (user?.role === "USER") {
      refreshCartCount();
      refreshWishlist();
      refreshUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowSuggestions(value.trim().length > 0);
    if (onSearch) onSearch(value);
  };

  const handleSearchFocus = () => {
    if (searchValue.trim()) setShowSuggestions(true);
    if (
      !onSearch &&
      user?.role === "USER" &&
      pathname !== "/user" &&
      pathname !== "/"
    ) {
      router.push("/user");
    }
  };

  return (
    <div
      className={`sticky top-0 z-30 transition-all duration-500 ease-in-out ${
        scrolled ? "px-2 sm:px-4 pt-1 sm:pt-3" : "px-0 pt-0"
      }`}
    >
      <nav
        className={`bg-white/95 backdrop-blur-md border border-slate-200/80 mx-auto transform-gpu transition-all duration-500 ease-in-out will-change-[max-width,border-radius,box-shadow,margin] ${
          scrolled
            ? "max-w-5xl rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] mt-1 sm:mt-2"
            : "max-w-none w-full rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] mt-0 border-x-0 border-t-0"
        }`}
      >
        <div
          className={`mx-auto flex items-center gap-2 sm:gap-6 transition-all duration-500 ease-in-out ${
            scrolled ? "px-3 sm:px-6 py-2" : "px-3 sm:px-6 py-2.5 sm:py-3.5"
          }`}
        >
          {/* Logo - icon always visible, text hidden on very small screens */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <ShoppingCart size={19} className="transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight hidden xs:inline whitespace-nowrap">
              {title}
            </span>
          </Link>

          {/* Search - always visible, shrinks gracefully, no overflow */}
          {(!user || user.role === "USER") && (
            <div className="flex-1 min-w-0 relative" ref={searchContainerRef}>
              <div className="relative w-full">
                <Search
                  className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={15}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  placeholder="Search products..."
                  className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 rounded-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                />
              </div>
              <AnimatePresence>
                {showSuggestions && (
                  <SearchSuggestions
                    query={searchValue}
                    onClose={() => setShowSuggestions(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {user && user.role !== "USER" && <div className="flex-1" />}

          {/* Right-side icons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {!user && (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-2.5 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4.5 py-1.5 sm:py-2 rounded-full whitespace-nowrap shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}

            {user?.role === "USER" && (
              <>
                <div className="hidden xs:block">
                  <NotificationBell />
                </div>

                <Link
                  href="/user/wishlist"
                  title="Wishlist"
                  className={`p-1.5 sm:p-2 rounded-xl transition-all duration-200 ${
                    pathname === "/user/wishlist"
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                  }`}
                >
                  <Heart size={19} />
                </Link>

                <Link
                  href="/user/cart"
                  title="Shopping Cart"
                  className={`relative p-1.5 sm:p-2 rounded-xl transition-all duration-200 ${
                    pathname === "/user/cart"
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                  }`}
                >
                  <ShoppingBag size={19} />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                        className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm"
                      >
                        {itemCount > 99 ? "99+" : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                <Link
                  href="/user/profile"
                  title="Profile"
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 overflow-hidden transition-all duration-200 ${
                    pathname === "/user/profile"
                      ? "ring-2 ring-blue-600 ring-offset-2 ring-offset-white shadow-sm"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100 ring-1 ring-slate-200/60"
                  }`}
                >
                  {user.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="bg-blue-50 w-full h-full flex items-center justify-center text-blue-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user && user.role !== "USER" && (
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline whitespace-nowrap">
                Hi,{" "}
                <span className="font-medium text-gray-900">{user.name}</span>
              </span>
            )}

            {user && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    logout();
                  }
                }}
                className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 px-1.5 sm:px-3 py-1.5 rounded-lg transition"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
