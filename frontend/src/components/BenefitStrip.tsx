"use client";

import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

export default function BenefitStrip() {
  const benefits = [
    {
      icon: Truck,
      title: "Free Express Shipping",
      desc: "On all orders above ₹999 across India",
    },
    {
      icon: RotateCcw,
      title: "7-Day Easy Returns",
      desc: "Hassle-free pickups & instant refund processing",
    },
    {
      icon: ShieldCheck,
      title: "100% Secure Payments",
      desc: "Razorpay verified UPI, Cards & Netbanking",
    },
    {
      icon: Headphones,
      title: "24/7 Dedicated Support",
      desc: "Direct WhatsApp, email & phone assistance",
    },
  ];

  return (
    <div className="bg-slate-50 border-y border-slate-200/60 py-8 my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
