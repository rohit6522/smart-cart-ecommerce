"use client";
import CategoryScroll from "@/components/user/CategoryScroll";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/user/ProductCard";
import { getAllProducts } from "@/lib/productApi";
import { addToCart } from "@/lib/cartApi";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { Search } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, []);

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

  // Guests get redirected to login when trying to shop; logged-in users add to cart normally
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

        {!loading && categories.length > 0 && (
          <CategoryScroll categories={categories} basePath="/user/products" />
        )}

        {!user && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-3 rounded-xl mb-8">
            👋 Browsing as guest — you can explore all products freely. To add
            items to your cart or place an order, you&apos;ll need to{" "}
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

        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="flex gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-52 h-64 flex-shrink-0 bg-white border border-gray-200 rounded-2xl animate-pulse"
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
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {category}
                </h2>
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
