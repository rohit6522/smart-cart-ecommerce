import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: August 2026</p>

          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Smart Cart, you agree to be bound by these Terms &
                Conditions. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Account Registration</h2>
              <p>
                To place an order, you must create an account with accurate and complete
                information. You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Orders & Payments</h2>
              <p>
                All orders are subject to product availability. Prices displayed are inclusive of
                applicable taxes unless stated otherwise. We accept payments via online payment
                methods (cards, UPI, wallets) and Cash on Delivery, where available. Smart Cart
                reserves the right to cancel any order due to stock unavailability, pricing
                errors, or suspected fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Cancellations & Returns</h2>
              <p>
                Orders can be cancelled before they are shipped. Once delivered, returns are
                accepted within 7 days, subject to the product passing inspection upon pickup.
                Refunds for approved returns are processed as per our return policy displayed at
                checkout and on the order details page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Coupons & Promotions</h2>
              <p>
                Discount coupons and referral rewards are subject to specific eligibility criteria
                (such as minimum order value or first-order restrictions) as displayed at the time
                of use. Smart Cart reserves the right to modify or withdraw any promotional offer
                at its discretion.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. User Conduct</h2>
              <p>
                You agree not to misuse the platform, including but not limited to submitting
                fraudulent orders, posting false reviews, or attempting to gain unauthorized
                access to other accounts or systems.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
              <p>
                Smart Cart is provided on an &quot;as-is&quot; basis. We are not liable for any
                indirect, incidental, or consequential damages arising from your use of the
                platform, to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to Terms</h2>
              <p>
                We may update these Terms & Conditions from time to time. Continued use of the
                platform after changes are posted constitutes your acceptance of the revised
                terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please reach out to us through our{" "}
                <a href="/user/support" className="text-blue-600 hover:underline">
                  Support page
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}