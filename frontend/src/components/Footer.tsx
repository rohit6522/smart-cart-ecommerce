"use client";

import Link from "next/link";
import { ShoppingCart, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-700 text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart size={22} />
            <span className="font-bold text-lg">Smart Cart</span>
          </div>
          <p className="text-sm text-blue-100 leading-relaxed">
            Your one-stop shopping destination. Shop smart, track your budget, and save more
            every day!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li>
              <Link href="/user" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/user/cart" className="hover:text-white transition">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/user/orders" className="hover:text-white transition">
                My Orders
              </Link>
            </li>
            <li>
              <Link href="/user/profile" className="hover:text-white transition">
                My Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li className="flex items-center gap-2">
              <MapPin size={15} /> Patna, Bihar, India
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} /> +91 00000 00000
            </li>
            <li className="flex items-center gap-2">
              <Mail size={15} /> support@smartcart.in
            </li>
          </ul>
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="hover:text-blue-200 transition">
              <Facebook size={18} />
            </a>
            <a href="#" className="hover:text-blue-200 transition">
              <Instagram size={18} />
            </a>
            <a href="#" className="hover:text-blue-200 transition">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-600 py-4 text-center text-sm text-blue-100">
        © 2026 Smart Cart. All rights reserved.
      </div>
    </footer>
  );
}