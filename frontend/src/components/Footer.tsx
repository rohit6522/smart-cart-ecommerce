"use client";

import Link from "next/link";
import { ShoppingCart, MapPin, Phone, Mail } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-300 border-t border-slate-800 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand info */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShoppingCart size={19} />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">Smart Cart</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your one-stop shopping destination. Shop smart, track your budget in real time,
            and save more every day!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-white mb-3.5 text-sm uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/user" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                Home
              </Link>
            </li>
            <li>
              <Link href="/user/cart" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/user/orders" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                My Orders
              </Link>
            </li>
            <li>
              <Link
                href="/user/profile"
                className="hover:text-white hover:translate-x-0.5 inline-block transition-all"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/user/support"
                className="hover:text-white hover:translate-x-0.5 inline-block transition-all"
              >
                Contact Support
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white hover:translate-x-0.5 inline-block transition-all">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-bold text-white mb-3.5 text-sm uppercase tracking-wider">Contact Us</h3>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li className="flex items-center gap-2.5">
              <MapPin size={16} className="text-blue-400 flex-shrink-0" /> Patna, Bihar, India
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-blue-400 flex-shrink-0" /> +91 9693031598
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-blue-400 flex-shrink-0" /> support@smartcart.in
            </li>
          </ul>

          <div className="flex items-center gap-2.5 mt-5">
            <a
              href="#"
              aria-label="Facebook"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-300 transition-all text-xs font-bold border border-slate-700/60"
            >
              f
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-pink-600 hover:text-white text-slate-300 transition-all text-xs font-bold border border-slate-700/60"
            >
              ig
            </a>
            <a
              href="https://x.com/home"
              aria-label="X / Twitter"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 transition-all text-xs font-bold border border-slate-700/60"
            >
              x
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500">
        <p>© 2026 Smart Cart. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3 mt-1.5 text-slate-400">
          <Link href="/terms" className="hover:text-white transition">
            Terms
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
