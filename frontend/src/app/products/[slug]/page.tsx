"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  ChevronRight,
  Info,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RatingStars from "@/components/RatingStars";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant & config selections
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState("");

  // Tabs state: "description" | "specifications" | "reviews"
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">(
    "description"
  );

  // Actions state
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // New review form state
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelatedProducts(data.relatedProducts || []);

          // Pre-select first variant options if available
          if (data.product?.variants?.length > 0) {
            const firstWithColor = data.product.variants.find((v: any) => v.color);
            if (firstWithColor) setSelectedColor(firstWithColor.color);
            const firstWithSize = data.product.variants.find((v: any) => v.size);
            if (firstWithSize) setSelectedSize(firstWithSize.size);
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-slate-100 rounded-3xl" />
            <div className="space-y-6">
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-3/4" />
              <div className="h-8 bg-slate-200 rounded w-1/3" />
              <div className="h-28 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            The product you requested does not exist or has been discontinued.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Gather unique sizes and colors from variants
  const availableSizes = Array.from(
    new Set((product.variants || []).map((v: any) => v.size).filter(Boolean))
  ) as string[];

  const availableColors = Array.from(
    new Set((product.variants || []).map((v: any) => v.color).filter(Boolean))
  ) as string[];

  const images = product.images?.length > 0 ? product.images : [{ url: product.imageUrl || "" }];
  const currentImage = images[activeImageIndex]?.url || images[0]?.url;
  const isWishlisted = isInWishlist(product._id);

  const validateOptions = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setValidationError("Please choose a size to continue");
      return false;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setValidationError("Please select a color option to continue");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateOptions()) return;
    setAddingToCart(true);

    const result = await addToCart(product, quantity, {
      selectedSize,
      selectedColor,
      variantLabel: [selectedSize, selectedColor].filter(Boolean).join(" / "),
    });

    setAddingToCart(false);
    if (result.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } else {
      setValidationError(result.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!validateOptions()) return;
    await addToCart(product, quantity, {
      selectedSize,
      selectedColor,
      variantLabel: [selectedSize, selectedColor].filter(Boolean).join(" / "),
    });
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          title: newReviewTitle,
          comment: newReviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMessage("Thank you! Your verified review has been published.");
        setReviews([data.review, ...reviews]);
        setNewReviewComment("");
        setNewReviewTitle("");
      } else {
        setReviewMessage(data.error || "Failed to submit review");
      }
    } catch {
      setReviewMessage("Network error while submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-slate-900">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category?.name && (
            <>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-slate-900"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>

        {/* Top Product Hero Showcase */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left 6 Columns: Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {product.discountPercentage && product.discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-extrabold px-3 py-1 rounded-md shadow-sm">
                    -{product.discountPercentage}% OFF
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product._id)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isWishlisted
                      ? "bg-red-50 text-red-500 shadow-sm"
                      : "bg-white/90 backdrop-blur-xs text-slate-600 hover:text-red-500 hover:bg-white shadow-xs"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
                  />
                </button>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((img: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? "border-orange-500 shadow-md ring-2 ring-orange-500/20"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right 6 Columns: Product Purchase & Details */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Brand & SKU */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-extrabold text-orange-600 uppercase tracking-widest text-xs">
                    {product.brand}
                  </span>
                  <span className="font-mono text-slate-600">SKU: {product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-3 text-xs">
                  <RatingStars
                    rating={product.rating || 4.8}
                    numReviews={product.numReviews || reviews.length}
                    size="md"
                  />
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 100% Genuine TROSTO Authentic
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-base text-slate-600 line-through">
                        ₹{product.compareAtPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                        Save {product.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Inclusive of all taxes. Free shipping on this order.
                  </p>
                </div>

                {/* Short description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.shortDescription || product.description?.slice(0, 180)}...
                </p>

                {/* Color Selection if applicable */}
                {availableColors.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Color: <strong className="text-orange-600">{selectedColor || "Select"}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      {availableColors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setSelectedColor(color);
                              setValidationError("");
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? "border-orange-600 bg-orange-50 text-orange-700 shadow-xs ring-1 ring-orange-500"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection if applicable */}
                {availableSizes.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Size: <strong className="text-orange-600">{selectedSize || "Select"}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      {availableSizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              setSelectedSize(size);
                              setValidationError("");
                            }}
                            className={`min-w-10 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? "border-orange-600 bg-orange-600 text-white shadow-xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity & Stock Availability */}
                <div>
                  <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Quantity
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-slate-700 hover:text-black font-bold text-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(product.stock || 10, q + 1))
                        }
                        className="px-3 py-2 text-slate-700 hover:text-black font-bold text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs">
                      {product.stock > 0 ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} available)
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold">Currently Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* CTAs: Add to Cart and Buy Now */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || addingToCart}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      addedSuccess
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-950 hover:bg-slate-900 text-white hover:scale-[1.01]"
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Cart!
                      </>
                    ) : addingToCart ? (
                      "Adding..."
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Zap className="w-5 h-5" /> Buy Now
                  </button>
                </div>
              </div>

              {/* Service Assurance Badges */}
              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Est. Delivery: 2-4 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>7-Day Return &amp; Exchange guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section: Description, Specifications, Reviews */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs mb-14">
          <div className="flex border-b border-slate-200 gap-6 sm:gap-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-sm font-bold tracking-tight transition-colors relative whitespace-nowrap ${
                activeTab === "description"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specifications")}
              className={`pb-4 text-sm font-bold tracking-tight transition-colors relative whitespace-nowrap ${
                activeTab === "specifications"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-sm font-bold tracking-tight transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Verified Reviews</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold">
                {reviews.length}
              </span>
            </button>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Designed for Daily Reliability
                    </h4>
                    <p className="text-xs text-slate-600">
                      Every element is rigorously stress-tested in-house to ensure high thermal, structural, and acoustic performance.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Authentic Warranty Coverage
                    </h4>
                    <p className="text-xs text-slate-600">
                      Protected by a 1-year brand warranty with doorstep repair or replacement across all major Indian metro hubs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="max-w-2xl">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="divide-y divide-slate-100 text-sm">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="py-3 flex justify-between">
                        <span className="font-medium text-slate-600">{key}</span>
                        <span className="font-bold text-slate-900 text-right">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">
                    Standard manufacturer specifications apply.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-10">
                {/* Rating Overview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="md:col-span-4 text-center md:text-left">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900">
                      {product.rating?.toFixed(1) || "4.8"}
                    </div>
                    <div className="my-1.5 flex justify-center md:justify-start">
                      <RatingStars rating={product.rating || 4.8} size="md" showScore={false} />
                    </div>
                    <p className="text-xs text-slate-600">
                      Based on {reviews.length || product.numReviews || 1} verified customer ratings
                    </p>
                  </div>

                  {/* Submission Notice / CTA */}
                  <div className="md:col-span-8 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Share your experience with the community
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      Your honest review helps fellow Trosto shoppers make informed decisions.
                    </p>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-slate-600 text-center py-6">
                      No reviews yet. Be the first to review this product!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev._id || rev.id}
                        className="p-5 rounded-2xl border border-slate-100 space-y-2 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {rev.userName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {rev.userName}
                                </span>
                                {rev.isVerifiedPurchase && (
                                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Verified Purchase
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-600">
                                {new Date(rev.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <RatingStars rating={rev.rating} size="sm" showScore={false} />
                        </div>
                        {rev.title && (
                          <h5 className="text-sm font-bold text-slate-900">{rev.title}</h5>
                        )}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Write Review Form */}
                <div className="border-t border-slate-200 pt-8">
                  <h4 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-600" /> Write a Review
                  </h4>

                  {reviewMessage && (
                    <div className="mb-4 p-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800">
                      {reviewMessage}
                    </div>
                  )}

                  <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 text-amber-400 focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Review Title (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Best headphones I have ever used!"
                        value={newReviewTitle}
                        onChange={(e) => setNewReviewTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Review Details
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell others what you loved or how it fits into your daily routine..."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Post Review"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div className="my-12">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6">
              You May Also Like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
