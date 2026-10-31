"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage(`Deleted product: ${name}`);
        setProducts(products.filter((p) => p._id !== id));
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Create, update, or archive products and track live stock counts
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {message && (
        <div className="p-3 bg-slate-900 text-white text-xs font-semibold rounded-xl">
          {message}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by product name, brand, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-extrabold tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-4">SKU / Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Inventory</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products found. Click &quot;Add Product&quot; to seed your catalog.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const img =
                    p.images?.[0]?.url ||
                    p.imageUrl ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200";

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                            <span className="text-[10px] text-slate-600 uppercase font-semibold">
                              {p.brand}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-slate-900 font-semibold block">
                          {p.sku}
                        </span>
                        <span className="text-[10px] text-slate-600">{p.category?.name || "General"}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">
                          ₹{p.price?.toLocaleString("en-IN")}
                        </span>
                        {p.compareAtPrice && (
                          <span className="text-[10px] text-slate-600 line-through block">
                            ₹{p.compareAtPrice?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.stock > 10 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {p.stock} In Stock
                          </span>
                        ) : p.stock > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {p.stock} Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">★ {p.rating || 0}</span>
                        <span className="text-[10px] text-slate-600 block">
                          ({p.numReviews || 0} reviews)
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="inline-block p-1.5 text-slate-400 hover:text-slate-700"
                          title="View on store"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${p._id}/edit`}
                          className="inline-block p-1.5 text-slate-400 hover:text-orange-600"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
