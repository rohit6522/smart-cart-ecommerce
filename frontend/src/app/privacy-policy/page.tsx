import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xs prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          <p>
            CartNova (&quot;TROSTO&quot;, &quot;we&quot;, &quot;our&quot;) is committed to respecting and protecting the privacy of our visitors and shoppers.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">1. Information We Collect</h3>
          <p>
            We collect personal information such as your name, email address, shipping delivery address, and contact number solely to process orders, deliver packages, and communicate order updates.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">2. Payment Security</h3>
          <p>
            All sensitive financial and payment credentials (card numbers, CVV, UPI PINs) are processed directly by <strong>Razorpay</strong> over PCI-DSS compliant 256-bit SSL encrypted channels. CartNova does not view, collect, or store payment card details on our database servers.
          </p>
          <h3 className="font-bold text-slate-900 text-sm">3. Data Protection</h3>
          <p>
            We implement strict database security protocols on MongoDB Atlas, including encrypted connections in transit and at rest, salted password hashing with bcrypt, and secure tokenized authentication.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
