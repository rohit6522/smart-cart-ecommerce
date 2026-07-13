"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CheckoutStepper from "@/components/user/CheckoutStepper";
import { getCart } from "@/lib/cartApi";
import { checkout } from "@/lib/orderApi";
import { createRazorpayOrder } from "@/lib/paymentApi";
import { useAuth } from "@/context/AuthContext";
import { CartResponse } from "@/types";
import { RazorpaySuccessResponse } from "@/types/razorpay";
import { MapPin, CreditCard, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

function CheckoutContent() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "COD">("COD");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    getCart()
      .then((data) => {
        if (data.items.length === 0) {
          router.push("/user/cart");
          return;
        }
        setCart(data);
      })
      .catch((err) => console.error("Failed to load cart", err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildAddressString = () => {
    return `${form.firstName} ${form.lastName}, ${form.street}, ${form.city}, ${form.state} ${form.zip}. Phone: ${form.phone}`;
  };

  const validateForm = (): boolean => {
    setError("");
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zip.trim() ||
      !form.phone.trim()
    ) {
      setError("Please fill in all shipping address fields");
      return false;
    }
    if ((paymentMethod === "CARD" || paymentMethod === "UPI") && paymentMethod === "CARD") {
      if (!cardName.trim() || !cardNumber.trim()) {
        setError("Please fill in your card details");
        return false;
      }
    }
    return true;
  };

  // ---------- Cash on Delivery ----------
  const handleCodOrder = async () => {
    setPlacingOrder(true);
    try {
      const order = await checkout({ deliveryAddress: buildAddressString() });
      router.push(`/user/order-success?orderId=${order.orderId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Checkout failed. Try again.");
      setPlacingOrder(false);
    }
  };

  // ---------- Razorpay online payment (covers both "Card" and "UPI/Wallet" selections) ----------
  const handleOnlineOrder = async () => {
    setPlacingOrder(true);
    setError("");

    try {
      const razorpayOrder = await createRazorpayOrder();

      const options = {
        key: razorpayOrder.razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Smart Cart",
        description: "Order Payment",
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#2563eb" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const order = await checkout({
              deliveryAddress: buildAddressString(),
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            router.push(`/user/order-success?orderId=${order.orderId}`);
          } catch (err: any) {
            setError(err?.response?.data?.message || "Payment verification failed");
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => setPlacingOrder(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to start payment");
      setPlacingOrder(false);
    }
  };

  const handlePay = () => {
    if (!validateForm()) return;

    if (paymentMethod === "COD") {
      handleCodOrder();
    } else {
      handleOnlineOrder();
    }
  };

  if (loading || !cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="h-96 bg-white border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const subtotal = cart.cartTotal;
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <CheckoutStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address + Payment forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-900">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    FIRST NAME
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    LAST NAME
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    STREET ADDRESS
                  </label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="123 Main St, Apartment or Suite"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">CITY</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      STATE
                    </label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="NY"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      ZIP CODE
                    </label>
                    <input
                      name="zip"
                      value={form.zip}
                      onChange={handleChange}
                      placeholder="10001"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    PHONE NUMBER
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`text-left border rounded-xl px-4 py-3 transition ${
                    paymentMethod === "CARD"
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">Credit Card</p>
                  <p className="text-xs text-gray-400">Visa, Master</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`text-left border rounded-xl px-4 py-3 transition ${
                    paymentMethod === "UPI"
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">UPI / Wallet</p>
                  <p className="text-xs text-gray-400">GPay, PhonePe</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`text-left border rounded-xl px-4 py-3 transition ${
                    paymentMethod === "COD"
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm">Cash on Delivery</p>
                  <p className="text-xs text-gray-400">Pay at your door</p>
                </button>
              </div>

              {paymentMethod === "CARD" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      CARDHOLDER NAME
                    </label>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      CARD NUMBER
                    </label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• 1234"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    You&apos;ll be redirected to our secure Razorpay checkout to complete this
                    payment.
                  </p>
                </div>
              )}

              {paymentMethod === "UPI" && (
                <p className="text-sm text-gray-500">
                  You&apos;ll be redirected to Razorpay to complete payment via UPI or your
                  preferred wallet.
                </p>
              )}

              {paymentMethod === "COD" && (
                <p className="text-sm text-gray-500">
                  Pay in cash when your order is delivered to your doorstep.
                </p>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4">Summary</h3>

              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ShoppingCart className="text-gray-300" size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="text-gray-900 font-medium">₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total amount</span>
                <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mt-4">
                  {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={placingOrder}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-5 transition disabled:opacity-50"
              >
                {placingOrder ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                {!placingOrder && <ChevronRight size={17} />}
              </button>

              <button
                onClick={() => router.push("/user/cart")}
                className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-3"
              >
                <ChevronLeft size={15} /> Return to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}