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
import Toast from "@/components/ui/Toast";


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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" onSearch={setSearch} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {!user && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/60 text-slate-700 text-xs sm:text-sm px-4 py-3.5 rounded-2xl mb-6 shadow-xs flex items-center justify-between flex-wrap gap-2">
            <span>
              👋 <strong>Browsing as guest</strong> — explore products freely. To add items to your cart or place an order, please{" "}
              <a href="/login" className="font-bold text-blue-600 hover:underline">
                login
              </a>{" "}
              or{" "}
              <a href="/register" className="font-bold text-blue-600 hover:underline">
                create an account
              </a>.
            </span>
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
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{activeCategory}</h2>
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-all"
            >
              <X size={12} /> Clear filter
            </button>
          </div>
        )}
        {!activeCategory && !loading && (
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-4">All Products</h2>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-white border border-slate-200/80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

     <Toast message={toast} />
    </div>
  );
}