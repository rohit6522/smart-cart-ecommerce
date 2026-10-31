"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Check,
  ArrowRight,
  Info,
  Lock,
  ChevronLeft,
  Banknote,
  MapPin,
  Tag,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";


export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();

  // Stepped Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Load Razorpay SDK script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (authLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading checkout...</div>;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode
    ) {
      setErrorMessage("Please fill in all required shipping address fields.");
      return false;
    }
    if (formData.phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Create order on server (recalculating all prices & stock)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          paymentMethod,
          couponCode: cart.coupon?.code,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { orderId, orderNumber } = orderData;

      // 2. Handle Payment Method
      if (paymentMethod === "COD") {
        await clearCart();
        router.push(`/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}&method=COD`);
        return;
      }

      // 3. Razorpay Payment Flow
      const rzpRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpData.error || "Failed to initialize Razorpay payment");
      }

      // Check if Razorpay modal can be opened
      if (window.Razorpay && !rzpData.keyId?.includes("placeholder")) {
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: "CARTNOVA (TROSTO)",
          description: `Order ${orderNumber}`,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: rzpData.customer.name,
            email: rzpData.customer.email,
            contact: rzpData.customer.phone,
          },
          theme: {
            color: "#ea580c", // Brand Orange
          },
          handler: async function (response: any) {
            // Verify signature on server
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              await clearCart();
              router.push(
                `/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}&paymentId=${response.razorpay_payment_id}`
              );
            } else {
              router.push(`/checkout/failed?orderId=${orderId}&error=${verifyData.error}`);
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setErrorMessage("Payment was dismissed. You can retry anytime.");
            },
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
      } else {
        // Test / Sandbox mode auto-verification
        const mockPaymentId = `pay_test_${Date.now()}`;
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpayOrderId: rzpData.razorpayOrderId,
            razorpayPaymentId: mockPaymentId,
            razorpaySignature: "mock_test_signature",
          }),
        });

        if (verifyRes.ok) {
          await clearCart();
          router.push(
            `/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}&paymentId=${mockPaymentId}&testMode=true`
          );
        } else {
          router.push(`/checkout/failed?orderId=${orderId}&error=MockVerificationFailed`);
        }
      }
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      setErrorMessage(err.message || "Failed to process checkout. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Secure Checkout
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 7 Columns: Shipping, Delivery & Payment */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Contact Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Contact &amp; Personal Info
                  </h2>
                  {!user && (
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-xs font-bold text-orange-600 hover:underline"
                    >
                      Already have an account? Sign In
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (for delivery updates) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (for invoice &amp; tracking) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address / House No. / Flat / Landmark *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      placeholder="e.g. Flat 402, Green Glen Layout, Bellandur"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="Bengaluru"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="Karnataka"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        placeholder="560103"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Razorpay Online */}
                  <label
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "RAZORPAY"
                        ? "border-orange-600 bg-orange-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="mt-1 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">
                          Razorpay (UPI / Google Pay / Cards / NetBanking)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Instant payment confirmation via PhonePe, GPay, Paytm, UPI QR, Credit &amp; Debit cards.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-orange-600 bg-orange-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">
                          Cash on Delivery (COD)
                        </span>
                        <Banknote className="w-4 h-4 text-slate-600" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Pay with cash or UPI directly to the courier executive upon doorstep delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary & Place Order */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                <h3 className="text-base font-extrabold text-slate-900">
                  Order Summary ({cart.items.length} items)
                </h3>

                {/* Items Mini List */}
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                  {cart.items.map((item) => (
                    <div
                      key={item._id || (item as any).id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                          {item.quantity}×
                        </span>
                        <span className="font-medium text-slate-800 truncate">
                          {item.product?.name || "Item"}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">
                      ₹{cart.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {cart.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount ({cart.coupon?.code})</span>
                      <span>-₹{cart.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    {cart.shipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900">₹{cart.shipping}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated GST (5%)</span>
                    <span className="font-bold text-slate-900">
                      ₹{cart.tax.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-slate-900">Final Total</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{cart.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {submitting
                    ? "Processing Order..."
                    : paymentMethod === "COD"
                    ? `Place COD Order (₹${cart.total.toLocaleString("en-IN")})`
                    : `Pay Securely (₹${cart.total.toLocaleString("en-IN")})`}
                </button>

                <p className="text-[11px] text-slate-600 text-center leading-normal">
                  By clicking Place Order, you agree to CartNova&rsquo;s Terms of Service and
                  confirm that your delivery address is accurate.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
