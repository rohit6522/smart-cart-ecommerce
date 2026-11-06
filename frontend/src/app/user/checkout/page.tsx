"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import CheckoutStepper from "@/components/user/CheckoutStepper";
import { getCart } from "@/lib/cartApi";
import { checkout } from "@/lib/orderApi";
import { createRazorpayOrder } from "@/lib/paymentApi";

import { getMyAddresses } from "@/lib/addressApi";
import { useAuth } from "@/context/AuthContext";
import { CartResponse, Address } from "@/types";
import { RazorpaySuccessResponse } from "@/types/razorpay";
import {
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  LocateFixed,
} from "lucide-react";
import { lookupPincode, getCurrentLocationAddress } from "@/lib/locationUtils";
import { getMyCoupons, applyCoupon } from "@/lib/couponApi";
import { CouponInfo } from "@/types";
import { Tag } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

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

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "COD">(
    "COD",
  );
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [myCoupons, setMyCoupons] = useState<CouponInfo[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  
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

    getMyCoupons()
      .then(setMyCoupons)
      .catch(() => {});

    getMyAddresses()
      .then((addresses) => {
        setSavedAddresses(addresses);
        const defaultAddr = addresses.find((a) => a.isDefault);
        if (defaultAddr) selectAddress(defaultAddr);
      })
      .catch((err) => console.error("Failed to load addresses", err));

    // If a coupon was applied on the Cart page, re-apply it here automatically
    const pendingCode = sessionStorage.getItem("pendingCoupon");
    if (pendingCode) {
      applyCoupon(pendingCode)
        .then((result) => {
          setAppliedCoupon({
            code: result.code,
            discountAmount: result.discountAmount,
          });
          setPromoCode(result.code);
        })
        .catch(() => {
          sessionStorage.removeItem("pendingCoupon");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const selectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    const [firstName, ...rest] = address.fullName.split(" ");
    setForm({
      firstName: firstName || "",
      lastName: rest.join(" ") || "",
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      phone: address.phone,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePincodeBlur = async () => {
    if (form.zip.length !== 6 || !/^\d{6}$/.test(form.zip)) return;
    setPincodeLoading(true);
    try {
      const result = await lookupPincode(form.zip);
      if (result) {
        setForm((prev) => ({
          ...prev,
          city: result.city,
          state: result.state,
        }));
      }
    } catch {
      // silent fail
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setError("");
    try {
      const location = await getCurrentLocationAddress();
      setForm((prev) => ({
        ...prev,
        street: location.street || prev.street,
        city: location.city || prev.city,
        state: location.state || prev.state,
        zip: location.zip || prev.zip,
      }));
    } catch (err: any) {
      setError(err.message || "Could not fetch your current location");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (applyingCoupon) return;
    if (!promoCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const result = await applyCoupon(promoCode.trim());
      setAppliedCoupon({
        code: result.code,
        discountAmount: result.discountAmount,
      });
      sessionStorage.setItem("pendingCoupon", result.code);
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCouponClick = async (code: string) => {
    setPromoCode(code);
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const result = await applyCoupon(code);
      setAppliedCoupon({
        code: result.code,
        discountAmount: result.discountAmount,
      });
      sessionStorage.setItem("pendingCoupon", result.code);
    } catch (err: any) {
      setCouponError(
        err?.response?.data?.message || "This coupon is not applicable",
      );
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    sessionStorage.removeItem("pendingCoupon");
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
    if (paymentMethod === "CARD" && (!cardName.trim() || !cardNumber.trim())) {
      setError("Please fill in your card details");
      return false;
    }
    return true;
  };

  // ---------- Cash on Delivery ----------
  const handleCodOrder = async () => {
    setPlacingOrder(true);
    try {
      const order = await checkout({
        deliveryAddress: buildAddressString(),
        couponCode: appliedCoupon?.code,
      });
      sessionStorage.removeItem("pendingCoupon");
      router.push(`/user/order-success?orderId=${order.orderId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Checkout failed. Try again.");
      setPlacingOrder(false);
    }
  };

  // ---------- Razorpay online payment ----------
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
              couponCode: appliedCoupon?.code,
            });
            sessionStorage.removeItem("pendingCoupon");
            router.push(`/user/order-success?orderId=${order.orderId}`);
          } catch (err: any) {
            setError(
              err?.response?.data?.message || "Payment verification failed",
            );
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar title="Smart Cart" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          <div className="h-96 bg-white border border-slate-200/80 rounded-3xl animate-pulse shadow-xs" />
        </div>
      </div>
    );
  }

  const subtotal = cart.cartTotal;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const tax = (subtotal - discount) * 0.06;
  const total = subtotal - discount + tax;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <CheckoutStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address + Payment forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <MapPin size={18} />
                  </div>
                  <h2 className="font-bold text-slate-900 text-lg tracking-tight">Shipping Address</h2>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 self-start sm:self-auto transition-colors"
                >
                  <LocateFixed size={14} />
                  {locationLoading ? "Locating..." : "Use My Current Location"}
                </button>
              </div>

              {savedAddresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectAddress(addr)}
                      className={`text-left border rounded-2xl p-4 relative transition-all duration-200 ${
                        selectedAddressId === addr.id
                          ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {selectedAddressId === addr.id && (
                        <Check
                          size={16}
                          className="absolute top-4 right-4 text-blue-600 font-bold"
                        />
                      )}
                      <span className="text-xs bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-full font-semibold text-slate-700">
                        {addr.label}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-2">
                        {addr.fullName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} {addr.zip}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs font-medium text-slate-400 mb-3">
                {savedAddresses.length > 0
                  ? "Or enter a new address below:"
                  : "Enter your delivery address:"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                    Street Address
                  </label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    placeholder="123 Main St, Apartment or Suite"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                    City
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                      State
                    </label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="NY"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                      Zip Code{" "}
                      {pincodeLoading && (
                        <span className="text-blue-500 text-2xs lowercase font-normal">(looking up...)</span>
                      )}
                    </label>
                    <input
                      name="zip"
                      value={form.zip}
                      onChange={handleChange}
                      onBlur={handlePincodeBlur}
                      placeholder="e.g. 284003"
                      maxLength={6}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-7">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <CreditCard size={18} />
                </div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`text-left border rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    paymentMethod === "CARD"
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900 text-sm">
                    Credit Card
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Visa, Master</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`text-left border rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    paymentMethod === "UPI"
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900 text-sm">
                    UPI / Wallet
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">GPay, PhonePe</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`text-left border rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    paymentMethod === "COD"
                      ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900 text-sm">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Pay at your door</p>
                </button>
              </div>

              {paymentMethod === "CARD" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                      Cardholder Name
                    </label>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-1.5 uppercase">
                      Card Number
                    </label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• 1234"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400 font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    You&apos;ll be redirected to our secure Razorpay checkout to
                    complete this payment.
                  </p>
                </div>
              )}

              {paymentMethod === "UPI" && (
                <p className="text-sm text-slate-500">
                  You&apos;ll be redirected to Razorpay to complete payment via
                  UPI or your preferred wallet.
                </p>
              )}

              {paymentMethod === "COD" && (
                <p className="text-sm text-slate-500">
                  Pay in cash when your order is delivered to your doorstep.
                </p>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs p-5 sm:p-6 sm:sticky sm:top-24">
              <h3 className="font-bold text-slate-900 text-lg mb-4 tracking-tight">Summary</h3>

              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <ShoppingCart className="text-slate-300" size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon box */}
              <div className="border-t border-slate-100 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-sm px-3.5 py-2.5 rounded-xl font-medium">
                    <span>
                      ✓ {appliedCoupon.code} (-₹
                      {appliedCoupon.discountAmount.toFixed(2)})
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 hover:underline text-xs font-semibold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter coupon code"
                        className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-mono tracking-wider transition-all placeholder:font-sans placeholder:tracking-normal text-slate-900"
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={applyingCoupon}
                        className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-xs"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-rose-600 text-xs mt-2 font-medium">
                        {couponError}
                      </p>
                    )}
                  </>
                )}
              </div>

              {!appliedCoupon && myCoupons.length > 0 && (
                <div className="mt-3 space-y-2 mb-4">
                  <p className="text-xs font-medium text-slate-400">
                    Available coupons for you:
                  </p>
                  {myCoupons.map((c) => {
                    const isEligible = subtotal >= c.minOrderValue;
                    return (
                      <button
                        key={c.id}
                        onClick={() => isEligible && handleCouponClick(c.code)}
                        disabled={!isEligible || applyingCoupon}
                        className={`w-full flex items-start gap-2 rounded-xl px-3 py-2 text-xs text-left transition ${
                          isEligible
                            ? "bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/70 cursor-pointer"
                            : "bg-slate-50 border border-slate-200/60 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <Tag
                          size={13}
                          className={`flex-shrink-0 mt-0.5 ${isEligible ? "text-amber-600" : "text-slate-400"}`}
                        />
                        <div>
                          <span
                            className={`font-mono font-bold ${isEligible ? "text-amber-800" : "text-slate-500"}`}
                          >
                            {c.code}
                          </span>
                          <span
                            className={
                              isEligible ? "text-amber-700 font-medium" : "text-slate-400"
                            }
                          >
                            {" "}
                            — {c.description}
                          </span>
                          {!isEligible && (
                            <p className="text-slate-400 mt-0.5 text-2xs">
                              Add ₹{(c.minOrderValue - subtotal).toFixed(2)}{" "}
                              more to unlock
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax (6%)</span>
                  <span className="text-slate-900 font-semibold">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-5 pt-4 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-base">
                  Total amount
                </span>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200/60 text-rose-700 text-xs sm:text-sm px-4 py-2.5 rounded-xl mt-4 font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={placingOrder}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl mt-6 shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {placingOrder
                  ? "Processing..."
                  : `Pay ${formatCurrency(total)}`}
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
