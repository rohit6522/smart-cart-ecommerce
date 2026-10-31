import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Terms &amp; Conditions</h1>
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          <p>
            Welcome to <strong>CartNova</strong>, operated under the <strong>TROSTO</strong> brand umbrella. By browsing or purchasing through this website, you agree to comply with and be bound by the following terms.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">1. Commercial Agreement</h3>
          <p>
            When placing an order, the contract is finalized only when CartNova confirms order dispatch. Prices listed are denominated in Indian Rupees (INR) and inclusive of statutory GST.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">2. Product Descriptions &amp; Accuracy</h3>
          <p>
            We endeavor to display products, color profiles, dimensions, and specifications as accurately as possible. However, actual colors may vary slightly depending on monitor hardware calibration.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">3. Limitation of Liability</h3>
          <p>
            CartNova shall not be liable for indirect, punitive, or consequential damages arising from the use or inability to use items purchased beyond the replacement value of the specific item.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
