import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BenefitStrip from "@/components/BenefitStrip";
import { Sparkles, ShieldCheck, Heart, Award, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Our Story &amp; Philosophy
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Crafted for Those Who Value Quality Over Noise.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            CARTNOVA is born from TROSTO&rsquo;s obsession with precision engineering, timeless aesthetics, and transparent commerce.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-extrabold text-slate-900">The TROSTO Standard</h2>
          <p>
            In a marketplace inundated with generic drop-shipped goods and inflated markups, CartNova was established with a singular, uncompromising objective: curate and manufacture everyday lifestyle equipment that meets rigorous standards of tactile beauty, longevity, and ergonomic comfort.
          </p>
          <p>
            From our beryllium acoustic drivers and titanium eyewear to hand-stitched full-grain Italian leather briefcases, every piece undergoes multi-stage quality validation before it is dispatched to your doorstep.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Direct Sourcing</h4>
              <p className="text-xs text-slate-600">
                Zero middlemen. We work directly with certified artisan tanneries and electronics fabricators.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Fair Pricing</h4>
              <p className="text-xs text-slate-600">
                Transparent margins with upfront price disclosures, real discounts, and zero deceptive fees.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">Indian Commerce</h4>
              <p className="text-xs text-slate-600">
                Tailored for Indian shoppers with native UPI instant checkout and pan-India express logistics.
              </p>
            </div>
          </div>
        </div>

        <BenefitStrip />
      </main>

      <Footer />
    </div>
  );
}
