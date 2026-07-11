"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Package, MapPin, UserCircle, LogOut } from "lucide-react";

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
    <aside className="w-full sm:w-64 bg-white border border-gray-200 rounded-2xl p-4 h-fit">
      <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
          <p className="text-xs text-gray-400">Shopper</p>
        </div>
      </div>

      <nav className="space-y-1 mt-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              pathname === href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={17} />
          Logout
        </button>
      </nav>
    </aside>
  );
}