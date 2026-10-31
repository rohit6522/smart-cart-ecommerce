"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Flame,
  Award,
  Clock,
  TrendingUp,
  Percent,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BenefitStrip from "@/components/BenefitStrip";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [dealsProducts, setDealsProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch categories
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }

        // Fetch products
        const [featRes, dealsRes, newRes] = await Promise.all([
          fetch("/api/products?featured=true&limit=8"),
          fetch("/api/products?discountOnly=true&limit=4"),
          fetch("/api/products?sort=newest&limit=4"),
        ]);

        if (featRes.ok) {
          const featData = await featRes.json();
          setFeaturedProducts(featData.products || []);
        }
        if (dealsRes.ok) {
          const dealsData = await dealsRes.json();
          setDealsProducts(dealsData.products || []);
        }
        if (newRes.ok) {
          const newData = await newRes.json();
          setNewArrivals(newData.products || []);
        }
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* 1. Large Promotional Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 lg:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_50%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Autumn &amp; Winter Collection 2026
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                  Elevate Your Everyday with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                    Precision Craft.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Discover curated audiophile gear, Italian full-grain leather, running performance essentials, and minimalist aesthetic home accessories designed for discerning lifestyles.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/products"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/30 hover:scale-[1.02]"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop All Products
                  </Link>
                  <Link
                    href="/products?discountOnly=true"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all"
                  >
                    <Flame className="w-5 h-5 text-orange-400" />
                    Explore Flash Deals
                  </Link>
                </div>

                {/* Micro trust stats */}
                <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-white">40k+</p>
                    <p className="text-xs text-slate-400">Happy Shoppers</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-orange-400">4.9 / 5</p>
                    <p className="text-xs text-slate-400">Verified Rating</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-white">2-Day</p>
                    <p className="text-xs text-slate-400">Express Delivery</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Showcase Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 group">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
                    alt="Trosto SoundPro ANC Headphones"
                    className="w-full aspect-4/3 sm:aspect-square object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Floating Highlight Tag */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                        Spotlight Deal
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">
                        Trosto SoundPro ANC Headphones
                      </h4>
                      <p className="text-xs text-slate-300">
                        ₹12,999 <span className="line-through text-slate-500">₹19,999</span>
                      </p>
                    </div>
                    <Link
                      href="/products/trosto-soundpro-anc-headphones"
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Benefits Strip */}
        <BenefitStrip />

        {/* 3. Shop by Category Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
                Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
            >
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200/70 hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={
                    cat.image ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-3.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.productCount !== undefined && (
                    <p className="text-[11px] text-slate-300">
                      {cat.productCount} items
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Featured Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
                Curated Picks
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
            >
              See More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Special Promotional Banner Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
          <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="bg-white/20 backdrop-blur-xs text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Limited Time Promo
              </span>
              <h3 className="text-2xl sm:text-4xl font-black">
                Up to 40% Off Premium Smartwatches &amp; Footwear
              </h3>
              <p className="text-sm text-orange-100">
                Apply coupon <strong className="bg-white text-orange-700 px-2 py-0.5 rounded font-mono font-bold">TROSTO20</strong> at checkout for an extra 20% discount on orders above ₹1,499.
              </p>
            </div>
            <Link
              href="/products?discountOnly=true"
              className="px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-extrabold text-sm shadow-md transition-all shrink-0 hover:scale-105"
            >
              Claim Deals Now
            </Link>
          </div>
        </section>

        {/* 6. Flash Deals / Hot Discounts */}
        {dealsProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-end justify-between mb-8">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-600" />
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
                    Flash Discounts
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                    Trending Deals
                  </h2>
                </div>
              </div>
              <Link
                href="/products?discountOnly=true"
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                All Deals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {dealsProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* 7. New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
                  Just Landed
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/products?sort=newest"
                className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                View Latest <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
