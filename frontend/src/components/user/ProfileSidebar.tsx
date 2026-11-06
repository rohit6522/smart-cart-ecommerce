"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  MapPin,
  UserCircle,
  LogOut,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/user/profile", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/orders", label: "My Orders", icon: Package },
  { href: "/user/profile/addresses", label: "Addresses", icon: MapPin },
  { href: "/user/profile/info", label: "Profile Info", icon: UserCircle },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full sm:w-64 bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 h-fit shadow-xs">
      <Link
        href="/user"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3 px-2 transition-colors group"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Back to Shopping
      </Link>
      <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base overflow-hidden shadow-2xs">
          {user?.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <p className="font-bold text-slate-900 text-sm tracking-tight">{user?.name}</p>
          <p className="text-xs text-slate-400 font-medium">Shopper</p>
        </div>
      </div>

      <nav className="space-y-1 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold transition-all border-l-4 ${
              pathname === href
                ? "bg-blue-50 text-blue-700 border-blue-600 rounded-r-xl"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent rounded-xl"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}

        <button
          onClick={() => {
            if (confirm("Are you sure you want to logout?")) {
              logout();
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
