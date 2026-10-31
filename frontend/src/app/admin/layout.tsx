"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (user.role !== "admin" && user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Authenticating admin...</div>;
  }

  if (!user || (user.role !== "admin" && user.role !== "ADMIN")) {
    return (
      <div className="p-12 text-center text-sm text-slate-500">
        Access restricted. Admin credentials required.
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Admin Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-900">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-slate-800/80">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg">
                C
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight flex items-center">
                  CART<span className="text-orange-500">NOVA</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 block -mt-1">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              View Storefront
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm text-slate-800">
              TROSTO Operations Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin: <strong>{user?.name}</strong></span>
            </div>
            <Link
              href="/"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg"
            >
              Shop Front →
            </Link>
          </div>
        </header>

        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
