import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: August 2026</p>

          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Information We Collect</h2>
              <p>
                We collect information you provide directly, such as your name, email address,
                phone number, delivery address, and payment details. We also collect data
                generated through your use of the platform, including order history, wishlist
                items, and browsing activity.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Your Information</h2>
              <p>
                Your information is used to process orders, personalize your shopping experience,
                send order updates and promotional communications, track budgets, and improve our
                platform&apos;s functionality. Payment information is processed securely through
                our payment partner, Razorpay, and is not stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Data Sharing</h2>
              <p>
                We do not sell your personal information to third parties. Your delivery details
                are shared with assigned delivery partners solely for the purpose of fulfilling
                your order. We may share information with service providers (such as payment
                processors and email services) strictly to operate our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Cookies & Local Storage</h2>
              <p>
                We use cookies and browser storage to keep you logged in, remember your
                preferences, and maintain your shopping cart across sessions. You can control
                cookie behavior through your browser settings, though disabling cookies may affect
                site functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Security</h2>
              <p>
                We implement industry-standard security measures, including password encryption,
                secure authentication, and OTP-based verification for sensitive account actions,
                to protect your personal information from unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Your Rights</h2>
              <p>
                You may access, update, or delete your account information at any time through
                your Profile settings. You may also contact our support team to request removal
                of your data, subject to any legal or record-keeping obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Third-Party Services</h2>
              <p>
                Our platform integrates with third-party services including Razorpay (payments),
                and email delivery providers for transactional communications. These services have
                their own privacy policies governing the handling of your data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We encourage you to review this
                page occasionally to stay informed about how we protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Contact Us</h2>
              <p>
                For any privacy-related questions or concerns, please reach out through our{" "}
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