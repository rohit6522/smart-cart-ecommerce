"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/user/ProductCard";
import CategoryScroll from "@/components/user/CategoryScroll";
import { getAllProducts } from "@/lib/productApi";
import { addToCart } from "@/lib/cartApi";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }, [products]);

  const visibleProducts = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [products, activeCategory, search]);

  const handleAddToCart = async (productId: number, quantity: number) => {
    if (!user) {
      router.push("/login?notice=login-required");
      return;
    }

    if (user.role !== "USER") {
      setToast("Only shopper accounts can add items to cart");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    try {
      await addToCart(productId, quantity);
      setToast("Item added to cart!");
      setTimeout(() => setToast(""), 2000);
    } catch (err: any) {
      setToast(err?.response?.data?.message || "Failed to add item");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" onSearch={setSearch} />

      <div className="max-w-6xl mx-auto px-6 py-6">
        {!user && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-xl mb-6">
            👋 Browsing as guest — you can explore all products freely. To add items to your
            cart or place an order, you&apos;ll need to{" "}
            <a href="/login" className="font-semibold underline">
              login
            </a>{" "}
            or{" "}
            <a href="/register" className="font-semibold underline">
              create an account
            </a>
            .
          </div>
        )}

        {!loading && categories.length > 0 && (
          <CategoryScroll
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        )}

        {activeCategory && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">{activeCategory}</h2>
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

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
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