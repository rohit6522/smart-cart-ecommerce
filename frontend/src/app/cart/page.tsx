"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Heart,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Tag,
  Check,
  ChevronLeft,
  PackageOpen,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, applyCoupon, removeCoupon } =
    useCart();
  const { toggleWishlist } = useWishlist();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    setCouponError("");
    const result = await applyCoupon(couponInput.trim());
    setApplyingCoupon(false);

    if (!result.success) {
      setCouponError(result.error || "Failed to apply coupon");
    } else {
      setCouponInput("");
    }
  };

  const handleMoveToWishlist = async (item: any) => {
    const prodId = item.product?._id || item.product?.id || item.product;
    if (prodId) {
      await toggleWishlist(prodId);
      await removeFromCart(item._id || item.id);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-6">
            <PackageOpen className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Your Shopping Cart is Empty
          </h2>
          <p className="text-sm text-slate-600 max-w-md mt-2 mb-8">
            Looks like you haven&rsquo;t added anything to your cart yet. Explore our curated collections to get started!
          </p>
          <Link
            href="/products"
            className="px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Start Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs text-slate-600 mb-1">
              <Link href="/" className="hover:text-slate-900">
                Home
              </Link>{" "}
              / <span className="text-slate-900 font-semibold">Shopping Cart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Shopping Cart ({cart.items.length}{" "}
              {cart.items.length === 1 ? "item" : "items"})
            </h1>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Two-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {cart.items.map((item) => {
                const product = item.product || {};
                const imageUrl =
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

                return (
                  <div key={item._id || (item as any).id} className="p-4 sm:p-6 flex gap-4 sm:gap-6">
                    {/* Item Image */}
                    <div className="w-20 sm:w-28 aspect-square rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={imageUrl}
                        alt={product.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details & Controls */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                              {product.brand || "TROSTO"}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-orange-600 line-clamp-2">
                              <Link href={`/products/${product.slug || product._id}`}>
                                {product.name}
                              </Link>
                            </h3>
                          </div>
                          <span className="text-base sm:text-lg font-extrabold text-slate-900 shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Variants selected if any */}
                        {(item.selectedSize || item.selectedColor || item.variantLabel) && (
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                            {item.selectedSize && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Actions Bar */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id || (item as any).id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="px-2.5 py-1 text-slate-700 hover:text-black font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item._id || (item as any).id,
                                item.quantity + 1
                              )
                            }
                            className="px-2.5 py-1 text-slate-700 hover:text-black font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-xs">
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-slate-600 hover:text-red-500 flex items-center gap-1 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Move to Wishlist</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item._id || (item as any).id)}
                            className="text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping button */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                <ChevronLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <h2 className="text-base font-extrabold text-slate-900">Order Summary</h2>

              {/* Coupon Form */}
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. WELCOME50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1.5">{couponError}</p>
                )}

                {/* Active Applied Coupon pill */}
                {cart.coupon && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono">
                      <Check className="w-3.5 h-3.5" />
                      <span>{cart.coupon.code}</span>
                      <span className="text-[10px] font-sans font-normal text-emerald-600">
                        (-₹{cart.discount.toLocaleString("en-IN")})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ₹{cart.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Savings</span>
                    <span>-₹{cart.discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  {cart.shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900">₹{cart.shipping}</span>
                  )}
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Estimated GST (5%)</span>
                  <span className="font-bold text-slate-900">
                    ₹{cart.tax.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{cart.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Guarantee */}
              <div className="pt-2 text-[11px] text-slate-600 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted 256-bit Razorpay Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
