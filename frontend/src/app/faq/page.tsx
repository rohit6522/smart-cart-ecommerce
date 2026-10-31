"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What payment methods are supported on CartNova?",
      a: "We accept all major Indian payment channels powered by Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, Mastercard credit/debit cards, and NetBanking across 50+ Indian banks. We also support Cash on Delivery (COD) on eligible pin codes.",
    },
    {
      q: "How long does shipping take?",
      a: "Metro deliveries across Mumbai, Bengaluru, Delhi NCR, Hyderabad, and Chennai typically arrive within 2-3 business days. Non-metro locations and rest-of-India orders are delivered within 4-5 business days via express air courier.",
    },
    {
      q: "What is your return and exchange policy?",
      a: "We offer a 7-day hassle-free return window on unworn apparel, sealed electronics, and unused lifestyle items. If you receive a damaged or mismatched product, you can initiate a return directly from your Order Details dashboard for a replacement or full refund.",
    },
    {
      q: "How do promotional coupon codes work?",
      a: "You can enter your promotional code (such as WELCOME50 for first-time shoppers or TROSTO20) in the coupon box on the Cart or Checkout screen. The discount will instantly be subtracted from your subtotal if minimum eligibility requirements are met.",
    },
    {
      q: "Are all products original and covered by warranty?",
      a: "Yes. Every item listed on CartNova is 100% genuine and comes with either manufacturer warranty or CartNova TROSTO 1-Year Doorstep Assurance.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Quick answers regarding checkout, shipping timelines, returns, and payment safety
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-orange-600 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openIndex === i ? "rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
