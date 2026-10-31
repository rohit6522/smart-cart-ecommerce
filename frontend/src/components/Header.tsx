"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Package,
  LogOut,
  LayoutDashboard,
  MapPin,
  Tag,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount, cart } = useCart();
  const { wishlistedIds } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Deals", href: "/products?discountOnly=true", highlight: true },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const categories = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Shoes", slug: "shoes" },
    { name: "Watches", slug: "watches" },
    { name: "Bags", slug: "bags" },
    { name: "Home & Kitchen", slug: "home-kitchen" },
    { name: "Beauty", slug: "beauty" },
    { name: "Books", slug: "books" },
    { name: "Accessories", slug: "accessories" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      {/* 1. Promotional Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
              Limited Offer
            </span>
            <span>
              Use code <strong className="text-orange-400 font-mono">WELCOME50</strong> for 50%
              off on your first order!
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-slate-300 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              Verified Razorpay Checkout
            </span>
            <span>Free Express Delivery on ₹999+</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 flex items-center">
                CART<span className="text-orange-500">NOVA</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-600 -mt-1">
                BY TROSTO
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "text-orange-600 bg-orange-50 font-semibold"
                      : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
                  } ${link.highlight ? "text-orange-600 font-semibold" : ""}`}
                >
                  {link.highlight && <Tag className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            })}

            {/* Categories Dropdown */}
            <div className="relative" onMouseLeave={() => setCategoriesOpen(false)}>
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  pathname.startsWith("/categories")
                    ? "text-orange-600 bg-orange-50 font-semibold"
                    : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
                }`}
              >
                Categories
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={() => setCategoriesOpen(true)}
                >
                  <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Featured Categories
                  </div>
                  <div className="divide-y divide-slate-50">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50/50 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-slate-300">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search premium electronics, shoes, fashion... (Press '/')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-3 focus:ring-orange-500/15 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Instant Search Results Dropdown */}
            {searchFocused && (searchLoading || searchResults.length > 0) && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-sm text-slate-400">Searching...</div>
                ) : (
                  <>
                    <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Product Matches
                    </div>
                    {searchResults.map((item) => (
                      <Link
                        key={item._id}
                        href={`/products/${item.slug}`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {item.images?.[0]?.url && (
                            <img
                              src={item.images[0].url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-orange-600 font-semibold">
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <div className="p-2 border-t border-slate-100 text-center">
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setSearchFocused(false)}
                        className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        View all results for &ldquo;{searchQuery}&rdquo; →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistedIds.size > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistedIds.size}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-800" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block text-xs font-bold text-slate-900">
                ₹{cart.total > 0 ? cart.total.toLocaleString("en-IN") : "0"}
              </span>
            </Link>

            {/* User Account Dropdown */}
            <div ref={accountRef} className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 hover:border-orange-300 transition-colors"
                  >
                    {user.avatar || user.profilePhoto ? (
                      <img
                        src={user.avatar || user.profilePhoto || ""}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 divide-y divide-slate-100 animate-in fade-in duration-150">
                      <div className="px-4 py-2">
                        <p className="text-xs text-slate-600 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 uppercase">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/account/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          Order History
                        </Link>
                        <Link
                          href="/account/addresses"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <MapPin className="w-4 h-4 text-slate-400" />
                          Addresses
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-block px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-950 hover:bg-orange-600 rounded-full transition-all shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-orange-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-orange-50 hover:text-orange-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {!user && (
            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 bg-orange-600 rounded-xl text-sm font-semibold text-white shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
