import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Return &amp; Refund Policy</h1>
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          <p>
            Customer satisfaction is at the core of the <strong>TROSTO</strong> experience. If you are not completely content with your purchase, our 7-day return policy ensures a smooth resolution.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">1. 7-Day Return Window</h3>
          <p>
            You may request a return within 7 calendar days of receiving your package. Items must be returned in their original packaging, unused, with all security tags, warranties, and accessories intact.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">2. Doorstep Pickup</h3>
          <p>
            Once approved via your customer dashboard, our partner courier executive will arrive at your registered delivery address within 24 to 48 hours to inspect and collect the return shipment.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">3. Refund Processing</h3>
          <p>
            Prepaid orders (Razorpay UPI, Cards, NetBanking) will be refunded directly back to the original source payment method within 5 to 7 working days. Cash on Delivery (COD) refunds will be issued via instant bank transfer or UPI once collection is verified.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
