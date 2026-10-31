"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  RotateCcw,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL State
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialDiscountOnly = searchParams.get("discountOnly") === "true";
  const initialFeatured = searchParams.get("featured") === "true";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Component State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(initialDiscountOnly);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortOption, setSortOption] = useState(initialSort);

  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load Categories once
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Products based on current filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
      if (minPrice > 0) params.set("minPrice", minPrice.toString());
      if (maxPrice < 50000) params.set("maxPrice", maxPrice.toString());
      if (selectedRating > 0) params.set("rating", selectedRating.toString());
      if (inStockOnly) params.set("inStock", "true");
      if (discountOnly) params.set("discountOnly", "true");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (sortOption) params.set("sort", sortOption);
      if (initialFeatured) params.set("featured", "true");
      params.set("page", pagination.currentPage.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalProducts: 0,
            limit: 12,
          }
        );
        if (data.availableBrands) {
          setAvailableBrands(data.availableBrands);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    selectedBrands,
    minPrice,
    maxPrice,
    selectedRating,
    inStockOnly,
    discountOnly,
    searchQuery,
    sortOption,
    initialFeatured,
    pagination.currentPage,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(50000);
    setSelectedRating(0);
    setInStockOnly(false);
    setDiscountOnly(false);
    setSearchQuery("");
    setSortOption("newest");
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header & Breadcrumbs */}
        <div className="mb-6">
          <div className="text-xs text-slate-600 mb-1">
            <span className="hover:text-slate-900 cursor-pointer" onClick={() => router.push("/")}>
              Home
            </span>{" "}
            / <span className="text-slate-700 font-semibold">Shop Products</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name || "All Products"
                  : "All Products"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Showing {products.length} of {pagination.totalProducts} premium items
              </p>
            </div>

            {/* Mobile Filter Trigger + Sort dropdown */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                Filters
              </button>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setPagination((p) => ({ ...p, currentPage: 1 }));
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest Arrivals</option>
                  <option value="popular">Sort: Most Popular</option>
                  <option value="price-asc">Sort: Price (Low to High)</option>
                  <option value="price-desc">Sort: Price (High to Low)</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="discount">Sort: Biggest Discounts</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Product Grid */}
        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
              setPagination((p) => ({ ...p, currentPage: 1 }));
            }}
            availableBrands={availableBrands}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            selectedRating={selectedRating}
            onSelectRating={(r) => {
              setSelectedRating(r);
              setPagination((p) => ({ ...p, currentPage: 1 }));
            }}
            inStockOnly={inStockOnly}
            onToggleInStock={(v) => {
              setInStockOnly(v);
              setPagination((p) => ({ ...p, currentPage: 1 }));
            }}
            discountOnly={discountOnly}
            onToggleDiscount={(v) => {
              setDiscountOnly(v);
              setPagination((p) => ({ ...p, currentPage: 1 }));
            }}
            onReset={handleResetFilters}
            isOpenMobile={mobileFilterOpen}
            onCloseMobile={() => setMobileFilterOpen(false)}
          />

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 animate-pulse"
                  >
                    <div className="w-full aspect-square bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 mb-6">
                  Try adjusting your price range, clearing brand filters, or searching with different keywords.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1}
                      onClick={() =>
                        setPagination((p) => ({ ...p, currentPage: p.currentPage - 1 }))
                      }
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === pagination.currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setPagination((p) => ({ ...p, currentPage: pageNum }))}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                            isActive
                              ? "bg-orange-600 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() =>
                        setPagination((p) => ({ ...p, currentPage: p.currentPage + 1 }))
                      }
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading CartNova Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
