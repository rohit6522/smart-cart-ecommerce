"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpDown, SlidersHorizontal, PackageOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        // Fetch categories to find this one
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          const currentCat = (catData.categories || []).find(
            (c: any) => c.slug === slug
          );
          setCategory(currentCat);
        }

        // Fetch products for this category
        const prodRes = await fetch(
          `/api/products?category=${slug}&sort=${sortOption}&limit=20`
        );
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
      } catch (err) {
        console.error("Failed to load category:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryData();
  }, [slug, sortOption]);

  const categoryName = category?.name || slug.replace("-", " ").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Category Hero Banner */}
        <div className="relative bg-slate-950 text-white overflow-hidden py-14 sm:py-20">
          {category?.bannerImage && (
            <img
              src={category.bannerImage}
              alt={categoryName}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/products" className="hover:text-white">
                Shop
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-orange-400 font-semibold">{categoryName}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white capitalize">
              {categoryName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-2">
              {category?.description ||
                `Explore our handpicked curation of ${categoryName} designed for lasting performance and style.`}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{products.length}</strong> items in{" "}
              {categoryName}
            </p>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discounts</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs h-72 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
              <PackageOpen className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">
                No products found in this category
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 mb-6">
                We are actively restocking this collection. Explore other categories or check back soon!
              </p>
              <Link
                href="/products"
                className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-500"
              >
                Explore All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
