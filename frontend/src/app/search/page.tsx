"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, PackageOpen, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    fetch(`/api/products?search=${encodeURIComponent(query)}&limit=24`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProducts(data?.products || []);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search Input Bar */}
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
            Search CartNova Catalog
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
              }
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search by keywords, brand, category, or specifications..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-28 py-3.5 text-sm shadow-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-xs font-bold transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Section */}
        {query && (
          <div className="mb-6 flex items-center justify-between text-xs text-slate-600">
            <p>
              Showing results for <strong className="text-slate-900">&ldquo;{query}&rdquo;</strong>{" "}
              ({products.length} found)
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs h-72 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
            <PackageOpen className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              No matching products found
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-6">
              Try searching with more general terms, brand names, or check your spelling.
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-500"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Searching...</div>}>
      <SearchContent />
    </Suspense>
  );
}
