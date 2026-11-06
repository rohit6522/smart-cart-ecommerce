"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/user/ProductCard";
import { getMyWishlist } from "@/lib/wishlistApi";
import { addToCart } from "@/lib/cartApi";
import { useCart } from "@/context/CartContext";
import { WishlistItem } from "@/types";
import { ArrowLeft, Heart } from "lucide-react";
import Toast from "@/components/ui/Toast";
import EmptyState from "@/components/ui/EmptyState";

function WishlistContent() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    getMyWishlist()
      .then(setItems)
      .catch((err) => console.error("Failed to load wishlist", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      await addToCart(productId, quantity);
      refreshCartCount();
      setToast("Item added to cart!");
      setTimeout(() => setToast(""), 2000);
    } catch (err: any) {
      setToast(err?.response?.data?.message || "Failed to add item");
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

     <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <button
          onClick={() => router.push("/user")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-semibold mb-4 transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Back to Shopping
        </button>

       <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-6">My Wishlist</h1>

        {loading ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-72 bg-white border border-slate-200/80 rounded-3xl animate-pulse shadow-xs"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love here so you can find them easily later."
            actionLabel="Browse Products"
            actionHref="/user"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {items.map((item) => (
              <ProductCard
                key={item.wishlistId}
                product={item.product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <Toast message={toast} />

      <Footer />
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <WishlistContent />
    </ProtectedRoute>
  );
}
