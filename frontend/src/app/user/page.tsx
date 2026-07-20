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
import { X } from "lucide-react";

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

  const visibleProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return result;
  }, [products, activeCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
     <Navbar title="Smart Cart" onSearch={setSearch} />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Category pills - clicking filters in place, no navigation */}
        {!loading && categories.length > 0 && (
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

        {/* Active filter indicator */}
        {activeCategory && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {activeCategory}
            </h2>
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full"
            >
              <X size={12} /> Clear filter
            </button>
          </div>
        )}
        {!activeCategory && !loading && (
          <h2 className="text-lg font-bold text-gray-900 mb-4">All Products</h2>
        )}

        {/* Mixed product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
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
