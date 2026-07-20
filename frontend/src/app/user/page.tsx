"use client";
import CategoryScroll from "@/components/user/CategoryScroll";
import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BudgetTracker from "@/components/user/BudgetTracker";
import ProductCard from "@/components/user/ProductCard";
import { getAllProducts } from "@/lib/productApi";
import { getCart, setBudget, addToCart } from "@/lib/cartApi";
import { Product, CartResponse } from "@/types";
import { Search } from "lucide-react";
import Link from "next/link";

function UserHomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Group products by category
  const productsByCategory = useMemo(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
    const groups: Record<string, Product[]> = {};
    filtered.forEach((p) => {
      const cat = p.category || "Others";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products, search]);

  const categories = Object.keys(productsByCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search bar */}
        <div className="relative mb-8">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* NEW: Category pills */}
        {!loading && categories.length > 0 && (
          <CategoryScroll categories={categories} basePath="/user/products" />
        )}

        {/* Budget Tracker - compact, always visible at top */}
        <div className="mb-8">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 animate-pulse h-24" />
          ) : (
            <BudgetTracker cart={cart} onSetBudget={handleSetBudget} />
          )}
        </div>

        {/* Product sections by category */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No products found.</p>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => (
              <section key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    {category}
                  </h2>
                  <Link
                    href={`/user/products?category=${encodeURIComponent(category)}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    View all →
                  </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin snap-x">
                  {productsByCategory[category].map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-52 snap-start"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
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
