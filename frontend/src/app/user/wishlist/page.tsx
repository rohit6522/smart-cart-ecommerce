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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <button
          onClick={() => router.push("/user")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Shopping
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-white border border-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <Heart className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">Your wishlist is empty. Start saving products you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ProductCard key={item.wishlistId} product={item.product} onAddToCart={handleAddToCart} />
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

export default function WishlistPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <WishlistContent />
    </ProtectedRoute>
  );
}