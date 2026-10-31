"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut, LayoutDashboard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "Order History", href: "/account/orders", icon: Package },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "My Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Account Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            {/* User Profile Mini Badge */}
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-base flex items-center justify-center shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 truncate">
                  {user?.name || "Guest Customer"}
                </h3>
                <p className="text-xs text-slate-600 truncate">{user?.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase">
                  {user?.role || "CUSTOMER"}
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-orange-600 text-white shadow-sm shadow-orange-600/20"
                        : "text-slate-600 hover:text-orange-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Account Sub-page Area */}
          <div className="lg:col-span-9 min-w-0">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
