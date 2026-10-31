"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Plus, ExternalLink } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setCategories(data?.categories || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Catalog taxonomy and homepage category display ordering
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))
        ) : (
          categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{cat.name}</h3>
                  <span className="font-mono text-[10px] text-slate-600">/{cat.slug}</span>
                  <p className="text-[11px] text-orange-600 font-bold mt-0.5">
                    {cat.productCount || 0} Products
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">
                {cat.description || "Curated category collections"}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-600">
                  Order: <strong>#{cat.displayOrder}</strong>
                </span>
                <Link
                  href={`/categories/${cat.slug}`}
                  target="_blank"
                  className="font-bold text-orange-600 hover:underline flex items-center gap-1"
                >
                  <span>View Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
