"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900 mt-20">
      {/* Newsletter Strip */}
      <div className="border-b border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
                Join the Trosto Club
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Unlock 15% Off Your Next Order + Exclusive Drops
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Subscribe to CartNova updates for flash deals, seasonal sales, and member-only coupons.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full max-w-md flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-orange-600/20"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4" /> Subscribed
                  </>
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-lg">
                C
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                CART<span className="text-orange-500">NOVA</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              TROSTO&rsquo;s flagship online shopping destination offering authentic luxury and everyday lifestyle essentials with transparent pricing, instant Indian UPI payments, and guaranteed express delivery.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                Cyber City, Hitech City, Hyderabad, TG 500081
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                +91 1800-CARTNOVA (Mon-Sat, 9AM - 8PM)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                support@cartnova.com
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/categories/electronics" className="hover:text-orange-400 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/categories/fashion" className="hover:text-orange-400 transition-colors">
                  Fashion &amp; Apparel
                </Link>
              </li>
              <li>
                <Link href="/categories/shoes" className="hover:text-orange-400 transition-colors">
                  Footwear &amp; Sneakers
                </Link>
              </li>
              <li>
                <Link href="/categories/watches" className="hover:text-orange-400 transition-colors">
                  Watches &amp; Smartbands
                </Link>
              </li>
              <li>
                <Link href="/categories/bags" className="hover:text-orange-400 transition-colors">
                  Bags &amp; Luggage
                </Link>
              </li>
              <li>
                <Link href="/categories/home-kitchen" className="hover:text-orange-400 transition-colors">
                  Home &amp; Kitchen
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/account/orders" className="hover:text-orange-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-orange-400 transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-orange-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-orange-400 transition-colors">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-orange-400 transition-colors">
                  Help &amp; FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-orange-400 transition-colors">
                  About TROSTO
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} CartNova (TROSTO). All rights reserved.
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Secure Payments via</span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-semibold">
              Razorpay
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-semibold">
              UPI / GPay / PhonePe
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-semibold">
              RuPay / Visa / MC
            </span>
            <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] font-semibold">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
