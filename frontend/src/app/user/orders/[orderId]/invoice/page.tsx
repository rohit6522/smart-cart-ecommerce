"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/orderApi";
import { OrderResponse } from "@/types";
import { Download } from "lucide-react";

export default function InvoicePage() {
  const params = useParams();
  const orderId = Number(params.orderId);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then(setOrder)
      .catch((err) => console.error("Failed to load order", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleDownload = () => {
    window.print();
  };

  if (loading || !order) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading invoice...</div>;
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.06;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">
      {/* Download button - hidden when printing */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-end print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg"
        >
          <Download size={16} /> Download as PDF
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-10 print:shadow-none print:border-0 print:rounded-none">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Cart</h1>
            <p className="text-sm text-gray-400">Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Order ID</p>
            <p className="font-semibold text-gray-900">#ORD-{order.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Billed To</p>
            <p className="text-gray-900 whitespace-pre-line">{order.deliveryAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 mb-1">Order Date</p>
            <p className="text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-gray-400 mb-1 mt-3">Payment Method</p>
            <p className="text-gray-900">
              {order.paymentStatus === "PAID" ? "Paid Online" : "Cash on Delivery"}
            </p>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 text-left">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 font-medium text-center">Qty</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-50">
                <td className="py-2.5 text-gray-900">{item.productName}</td>
                <td className="py-2.5 text-center text-gray-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-600">
                  ₹{item.priceAtPurchase.toFixed(2)}
                </td>
                <td className="py-2.5 text-right font-medium text-gray-900">
                  ₹{item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 text-base">
              <span>Total Paid</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Thank you for shopping with Smart Cart!
        </p>
      </div>
    </div>
  );
}