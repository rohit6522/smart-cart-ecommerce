"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import BudgetTracker from "@/components/user/BudgetTracker";
import CartItemRow from "@/components/user/CartItemRow";
import { getCart, updateCartItem, removeCartItem, setBudget } from "@/lib/cartApi";
import { checkout } from "@/lib/orderApi";
import { createRazorpayOrder } from "@/lib/paymentApi";
import { useAuth } from "@/context/AuthContext";
import { CartResponse } from "@/types";
import { RazorpaySuccessResponse } from "@/types/razorpay";
import { ArrowLeft, ShoppingBag, CreditCard, Banknote } from "lucide-react";
import Link from "next/link";

function CartContent() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "COD">("ONLINE");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
    const updated = await updateCartItem(cartItemId, quantity);
    setCart(updated);
  };

  const handleRemove = async (cartItemId: number) => {
    const updated = await removeCartItem(cartItemId);
    setCart(updated);
  };

  const handleSetBudget = async (amount: number) => {
    const updated = await setBudget(amount);
    setCart(updated);
  };

  const validateBeforeCheckout = (): boolean => {
    setError("");
    if (!address.trim()) {
      setError("Please enter a delivery address");
      return false;
    }
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      return false;
    }
    return true;
  };

  // ---------- Cash on Delivery flow ----------
  const handleCodCheckout = async () => {
    setPlacingOrder(true);
    try {
      const order = await checkout({ deliveryAddress: address });
      router.push(`/user/orders/${order.orderId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Checkout failed. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ---------- Razorpay online payment flow ----------
  const handleOnlineCheckout = async () => {
    setPlacingOrder(true);
    setError("");

    try {
      // Step 1: ask backend to create a Razorpay order (amount computed server-side from cart)
      const razorpayOrder = await createRazorpayOrder();

      // Step 2: open Razorpay's checkout popup
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
          // Step 3: payment succeeded on Razorpay's side - now verify + create order on our backend
          try {
            const order = await checkout({
              deliveryAddress: address,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            router.push(`/user/orders/${order.orderId}`);
          } catch (err: any) {
            setError(err?.response?.data?.message || "Payment verification failed");
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed the popup without paying
            setPlacingOrder(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to start payment");
      setPlacingOrder(false);
    }
  };

  const handleCheckout = () => {
    if (!validateBeforeCheckout()) return;

    if (paymentMethod === "ONLINE") {
      handleOnlineCheckout();
    } else {
      handleCodCheckout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Smart Cart" />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Smart Cart" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/user/products")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

        <div className="mb-6">
          <BudgetTracker cart={cart} onSetBudget={handleSetBudget} />
        </div>

        {isEmpty ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link
              href="/user/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-gray-600">Cart Total</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{cart.cartTotal.toFixed(2)}
                </span>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Payment method selector */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`flex items-center gap-2 justify-center py-2.5 rounded-lg border text-sm font-medium transition ${
                    paymentMethod === "ONLINE"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard size={16} /> Pay Online
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-2 justify-center py-2.5 rounded-lg border text-sm font-medium transition ${
                    paymentMethod === "COD"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Banknote size={16} /> Cash on Delivery
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-3">
                  {error}
                </div>
              )}

              {cart.overBudget && (
                <div className="bg-yellow-50 text-yellow-700 text-sm px-4 py-2 rounded-lg mb-3">
                  Heads up — you&apos;re over your set budget. You can still place the order if you&apos;d like.
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={placingOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
              >
                {placingOrder
                  ? "Processing..."
                  : paymentMethod === "ONLINE"
                  ? `Pay ₹${cart.cartTotal.toFixed(2)}`
                  : "Place Order (COD)"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <CartContent />
    </ProtectedRoute>
  );
} 