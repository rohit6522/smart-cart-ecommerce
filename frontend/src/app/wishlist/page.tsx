"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ShoppingCart, PackageOpen, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = async () => {
    for (const prod of wishlist) {
      if (prod && (prod.stock || 1) > 0) {
        await addToCart(prod, 1);
        await toggleWishlist(prod._id || prod.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs text-slate-600 mb-1">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>{" "}
              / <span className="text-slate-900 font-semibold">My Wishlist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              Saved Wishlist ({wishlist.length})
            </h1>
          </div>

          {wishlist.length > 0 && (
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Move All to Cart
            </button>
          )}
        </div>

        {!user ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-lg mx-auto my-10">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Sign in to sync your Wishlist</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-6">
              Create an account or login to access your saved favorites across all your devices.
            </p>
            <Link
              href="/login?redirect=/wishlist"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20"
            >
              Sign In Now
            </Link>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-10">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-6">
              Explore our bestsellers and tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((prod) => {
              if (!prod) return null;
              const imgUrl =
                prod.images?.[0]?.url ||
                prod.imageUrl ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

              return (
                <div
                  key={prod._id || prod.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-slate-50">
                    <img
                      src={imgUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod._id || prod.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-500 shadow-xs flex items-center justify-center hover:bg-white"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-600">
                        {prod.brand}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        <Link href={`/products/${prod.slug || prod._id}`}>{prod.name}</Link>
                      </h4>
                      <p className="text-sm font-extrabold text-slate-900 mt-1">
                        ₹{prod.price?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(prod, 1);
                        toggleWishlist(prod._id || prod.id);
                      }}
                      className="w-full py-2 bg-slate-950 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
