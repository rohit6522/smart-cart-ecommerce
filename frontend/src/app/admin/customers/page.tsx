"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone, ShoppingBag, IndianRupee } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCustomers(data?.customers || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Directory</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Shopper accounts, lifetime order frequencies, and aggregate spending
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-extrabold tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center shrink-0">
                          {c.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <span className="text-[10px] text-slate-600">{c.role}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-900">{c.email}</p>
                      <p className="text-[11px] text-slate-600">{c.phone || "No phone added"}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{c.totalOrders || 0}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{(c.totalSpent || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-6 text-slate-600">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
