"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarRating from "@/components/user/StarRating";
import { getProductById } from "@/lib/productApi";
import { getProductReviews, submitReview } from "@/lib/reviewApi";
import { addToCart } from "@/lib/cartApi";
import { Product, Review } from "@/types";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import ZoomableImage from "@/components/user/ZoomableImage";
import { useMemo } from "react";
import { getAllProducts } from "@/lib/productApi";
import ProductCard from "@/components/user/ProductCard";
import { Variant } from "@/types";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.productId);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [toast, setToast] = useState("");

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchData = async () => {
    try {
      const [productData, reviewsData, allProductsData] = await Promise.all([
        getProductById(productId),
        getProductReviews(productId),
        getAllProducts(),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
      setAllProducts(allProductsData);
    } catch (err) {
      console.error("Failed to load product", err);
    } finally {
      setLoading(false);
    }
  };

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 8);
  }, [allProducts, product]);

  useEffect(() => {
    if (product && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity, selectedVariant?.id);
      setToast("Item added to cart!");
      setTimeout(() => setToast(""), 2000);
    } catch (err: any) {
      setToast(err?.response?.data?.message || "Failed to add item");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const handleSubmitReview = async () => {
    setReviewError("");
    if (myRating === 0) {
      setReviewError("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(productId, { rating: myRating, comment: myComment });
      setMyRating(0);
      setMyComment("");
      const updatedReviews = await getProductReviews(productId);
      setReviews(updatedReviews);
      const updatedProduct = await getProductById(productId);
      setProduct(updatedProduct);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar title="Smart Cart" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          <div className="h-96 bg-white border border-slate-200/80 rounded-3xl animate-pulse shadow-xs" />
        </div>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 font-semibold mb-4 transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" /> Back
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 mb-8 shadow-xs">
          <ZoomableImage src={product.imageUrl} alt={product.name} />

          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full inline-block">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-2 tracking-tight">
              {product.name}
            </h1>

            {product.totalReviews > 0 && (
              <div className="mb-3">
                <StarRating
                  rating={product.averageRating}
                  size={18}
                  showCount={product.totalReviews}
                />
              </div>
            )}

            <p className="text-slate-600 mb-5 leading-relaxed text-sm sm:text-base">{product.description}</p>

            <div className="flex flex-wrap items-baseline gap-2.5 mb-5">
              {product.discountPercentage > 0 ? (
                <>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    ₹{product.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-slate-400 line-through text-sm sm:text-base font-medium">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {product.variants.length > 0 && (
              <div className="mb-5">
                {/* Group variants by type (Size, Color) for cleaner display */}
                {Array.from(
                  new Set(product.variants.map((v) => v.variantType)),
                ).map((type) => (
                  <div key={type} className="mb-3">
                    <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2 uppercase">
                      {type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants
                        .filter((v) => v.variantType === type)
                        .map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariant(variant)}
                            disabled={variant.stockQuantity === 0}
                            className={`px-3.5 py-1.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${
                              selectedVariant?.id === variant.id
                                ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-2xs"
                                : variant.stockQuantity === 0
                                  ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50"
                                  : "border-slate-200 text-slate-700 hover:border-slate-300 bg-white"
                            }`}
                          >
                            {variant.variantValue}
                            {variant.stockQuantity === 0 && " (Out of stock)"}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p
              className={`text-sm mb-5 font-semibold ${
                outOfStock
                  ? "text-rose-500"
                  : product.stockQuantity <= 5
                    ? "text-amber-600 animate-pulse"
                    : "text-slate-500"
              }`}
            >
              {outOfStock
                ? "Out of stock"
                : product.stockQuantity <= 5
                  ? `⚡ Hurry! Only ${product.stockQuantity} left in stock`
                  : `${product.stockQuantity} in stock`}
            </p>

            {!outOfStock && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="inline-flex items-center justify-between sm:justify-start gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1 shadow-2xs w-fit">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white active:scale-90 transition-all"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                    }
                    aria-label="Increase quantity"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white active:scale-90 transition-all"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
            Customer Reviews
          </h2>

          {/* Write a review */}
          <div className="border border-slate-200/80 rounded-2xl p-5 mb-6 bg-slate-50/60">
            <p className="text-sm font-semibold text-slate-800 mb-2">
              Purchased and received this product? Share your experience.
            </p>
            <div className="flex items-center gap-1.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setMyRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={star <= myRating ? "#facc15" : "none"}
                    stroke={star <= myRating ? "#facc15" : "#cbd5e1"}
                    strokeWidth={1.5}
                    className="w-7 h-7 sm:w-6 sm:h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              ))}
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Write your review (optional)..."
              rows={2}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm mb-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
            />
            {reviewError && (
              <p className="text-rose-600 text-sm mb-2 font-medium">{reviewError}</p>
            )}
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-xs"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">
                      {review.userName}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 tracking-tight">
              You May Also Like
            </h2>
            <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-3">
              {similarProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-52 sm:w-60">
                  <ProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <ProductDetailContent />
    </ProtectedRoute>
  );
}
