"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BudgetTracker from "@/components/user/BudgetTracker";
import ProductCard from "@/components/user/ProductCard";
import CategoryScroll from "@/components/user/CategoryScroll";
import { getAllProducts } from "@/lib/productApi";
import { getCart, setBudget, addToCart } from "@/lib/cartApi";
import { Product, CartResponse } from "@/types";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";

const PREVIEW_COUNT = 6;

function UserHomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([getAllProducts(), getCart()])
      .then(([productsData, cartData]) => {
        setProducts(productsData);
        setCart(cartData);
      })
      .catch((err) => console.error("Failed to load home data", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSetBudget = async (amount: number) => {
    const updated = await setBudget(amount);
    setCart(updated);
  };

  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      const updated = await addToCart(productId, quantity);
      setCart(updated);
      setToast("Item added to cart!");
      setTimeout(() => setToast(""), 2000);
    } catch (err: any) {
      setToast(err?.response?.data?.message || "Failed to add item");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  // Search always searches across everything, regardless of category view
  const searchedProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  // Products grouped by category, capped to PREVIEW_COUNT each - used for the default view
  const productsByCategory = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    searchedProducts.forEach((p) => {
      const cat = p.category || "Others";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [searchedProducts]);

  // Full product list for the active category - used when a category is selected
  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return searchedProducts.filter((p) => p.category === activeCategory);
  }, [searchedProducts, activeCategory]);

  const isSearching = search.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" onSearch={setSearch} />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Category pills - always visible for quick navigation */}
        {!loading && categories.length > 0 && !isSearching && (
          <CategoryScroll
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        )}

        {/* Budget Tracker */}
        <div className="mb-8">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 animate-pulse h-24" />
          ) : (
            <BudgetTracker cart={cart} onSetBudget={handleSetBudget} />
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isSearching ? (
          // ---------- Search results view ----------
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Search results for &quot;{search}&quot;
            </h2>
            {searchedProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No products found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </>
        ) : activeCategory ? (
          // ---------- Single category, full list view ----------
          <>
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              <ArrowLeft size={16} /> Back to all categories
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{activeCategory}</h2>

            {categoryProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No products in this category.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </>
        ) : (
          // ---------- Default view: preview rows per category ----------
          <div className="space-y-10">
            {Object.keys(productsByCategory).map((category) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">{category}</h2>
                  <button
                    onClick={() => setActiveCategory(category)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all <ChevronRight size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productsByCategory[category].slice(0, PREVIEW_COUNT).map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
      <Footer />
    </div>
  );
}

export default function UserHomePage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <UserHomeContent />
    </ProtectedRoute>
  );
}