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

import { useMemo } from "react";
import { getAllProducts } from "@/lib/productApi";
import ProductCard from "@/components/user/ProductCard";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.productId);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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
    if (productId) fetchData();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity);
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
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="h-96 bg-white border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="h-72 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingCart className="text-gray-300" size={48} />
            )}
          </div>

          <div>
            <span className="text-xs text-blue-600 font-medium">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-2">
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

            <p className="text-gray-500 mb-4">{product.description}</p>

            <div className="flex items-center gap-2 mb-4">
              {product.discountPercentage > 0 ? (
                <>
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-gray-400 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            <p
              className={`text-sm mb-4 font-medium ${
                outOfStock
                  ? "text-red-500"
                  : product.stockQuantity <= 5
                    ? "text-orange-600 animate-pulse"
                    : "text-gray-500"
              }`}
            >
              {outOfStock
                ? "Out of stock"
                : product.stockQuantity <= 5
                  ? `⚡ Hurry! Only ${product.stockQuantity} left in stock`
                  : `${product.stockQuantity} in stock`}
            </p>

            {!outOfStock && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                    }
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg"
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Customer Reviews
          </h2>

          {/* Write a review */}
          <div className="border border-gray-100 rounded-xl p-4 mb-6 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Purchased and received this product? Share your experience.
            </p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setMyRating(star)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={star <= myRating ? "#facc15" : "none"}
                    stroke={star <= myRating ? "#facc15" : "#d1d5db"}
                    strokeWidth={1.5}
                    className="w-6 h-6"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {reviewError && (
              <p className="text-red-600 text-sm mb-2">{reviewError}</p>
            )}
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No reviews yet. Be the first!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {review.userName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-1.5">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              You May Also Like
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {similarProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-52">
                  <ProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))}
            </div>
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

export default function ProductDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <ProductDetailContent />
    </ProtectedRoute>
  );
}
