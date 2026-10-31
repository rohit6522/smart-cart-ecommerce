import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Shipping &amp; Delivery Policy</h1>
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          <p>
            At <strong>CartNova (TROSTO)</strong>, we take pride in delivering your orders in pristine condition and with maximum efficiency across all serviceable postal codes in India.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">1. Delivery Timelines</h3>
          <p>
            Standard express delivery across metropolitan zones (Delhi NCR, Bengaluru, Mumbai, Hyderabad, Pune, Kolkata, Chennai) takes 2 to 3 business days. Tier-2 and Tier-3 cities typically take 3 to 5 business days from the moment of dispatch.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">2. Shipping Charges</h3>
          <p>
            All domestic orders with an item subtotal of <strong>₹999 or more</strong> qualify for <strong>FREE Shipping</strong>. For orders below ₹999, a nominal flat express shipping fee of ₹99 is applied at checkout.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">3. Order Tracking</h3>
          <p>
            Upon dispatch, a unique consignment tracking number is generated and linked to your CartNova Order dashboard, accompanied by SMS and email alerts containing real-time live location tracking links.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
