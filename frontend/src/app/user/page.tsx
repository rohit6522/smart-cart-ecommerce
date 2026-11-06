"use client";
import HeroCarousel from "@/components/user/HeroCarousel";
import { useEffect, useState, useMemo, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BudgetTracker from "@/components/user/BudgetTracker";
import ProductCard from "@/components/user/ProductCard";
import CategoryScroll from "@/components/user/CategoryScroll";
import { getAllProducts } from "@/lib/productApi";
import { getCart, setBudget, addToCart } from "@/lib/cartApi";
import { Product, CartResponse } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/ui/Toast";
import PageTransition from "@/components/PageTransition";
const PREVIEW_COUNT = 4;

function UserHomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const productsRef = useRef<HTMLDivElement>(null);
  const { refreshCartCount } = useCart();

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    refreshCartCount();  // <-- add this line
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

  const searchedProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  // Default home view: ALL categories mixed together, capped to 4 products total
  const mixedPreview = useMemo(() => {
    return searchedProducts.slice(0, PREVIEW_COUNT);
  }, [searchedProducts]);

  // When a category is selected: show every product in just that category
  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];
    return searchedProducts.filter((p) => p.category === activeCategory);
  }, [searchedProducts, activeCategory]);

  const isSearching = search.trim().length > 0;

  return (
    <PageTransition> 
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <Navbar title="Smart Cart" onSearch={setSearch} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        <HeroCarousel onShopNow={scrollToProducts} />

        {!loading && categories.length > 0 && !isSearching && (
          <CategoryScroll
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        )}

        <div ref={productsRef} className="mb-2">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 animate-pulse h-24" />
          ) : (
            <BudgetTracker cart={cart} onSetBudget={handleSetBudget} />
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-72 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-xs"
              />
            ))}
          </div>
        ) : isSearching ? (
  <>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
        Search results for &quot;{search}&quot;
      </h2>
      <button
        onClick={() => setSearch("")}
        className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
      >
        Clear Search
      </button>
    </div>
    {searchedProducts.length === 0 ? (
      <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-8">
        <p className="text-slate-500 mb-3 text-base">No products found for &quot;{search}&quot;</p>
        <button
          onClick={() => setSearch("")}
          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-semibold transition-colors"
        >
          Clear Search
        </button>
      </div>
    ) : (

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {searchedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </>
        ) : activeCategory ? (
          <>
            <button
              onClick={() => setActiveCategory(null)}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Back to all products
            </button>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeCategory}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
              </span>
            </div>

            {categoryProducts.length === 0 ? (
              <p className="text-center text-slate-500 py-16 bg-white border border-slate-200/80 rounded-2xl">
                No products in this category.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Featured Products
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Hand-picked selections for your smart shopping
                </p>
              </div>
            </div>
            {mixedPreview.length === 0 ? (
              <p className="text-center text-slate-500 py-16 bg-white border border-slate-200/80 rounded-2xl">
                No products found.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {mixedPreview.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Toast message={toast} />

      <Footer />
    </div>
    </PageTransition>
  );
}

export default function UserHomePage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <UserHomeContent />
    </ProtectedRoute>
  );
}
