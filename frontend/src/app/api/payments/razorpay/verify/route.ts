import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import Payment from "@/models/Payment";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectToDatabase();

    const body = await req.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing required payment parameters" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, user: user._id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: If already marked as paid, return success immediately
    if (order.isPaid) {
      return NextResponse.json(
        { success: true, message: "Order is already paid", orderNumber: order.orderNumber },
        { status: 200 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify signature if secret is configured and not placeholder
    if (keySecret && !keySecret.includes("placeholder")) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        // Record failed payment attempt
        await Payment.create({
          order: order._id,
          user: user._id,
          amount: order.totalPrice,
          currency: "INR",
          status: "FAILED",
          method: "RAZORPAY",
          razorpayOrderId,
          razorpayPaymentId,
          errorReason: "Signature mismatch verification failed",
        });

        return NextResponse.json(
          { error: "Payment verification failed. Invalid signature." },
          { status: 400 }
        );
      }
    }

    // Payment Verified! Update Order atomically
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = "PROCESSING";
    order.paymentResult = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || "verified_in_test_mode",
      status: "PAID",
      paidAt: new Date(),
    };

    order.statusHistory.push({
      status: "PROCESSING",
      timestamp: new Date(),
      note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId})`,
    });

    await order.save();

    // Deduct stock for purchased items
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Record Payment transaction
    await Payment.create({
      order: order._id,
      user: user._id,
      amount: order.totalPrice,
      currency: "INR",
      status: "SUCCESS",
      method: "RAZORPAY",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    // Update coupon usage count if applied
    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode },
        { $inc: { usedCount: 1 } }
      );
    }

    // Clear user's active cart
    await Cart.findOneAndUpdate(
      { user: user._id },
      { $set: { items: [], coupon: null, subtotal: 0, discount: 0, total: 0 } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Payment successfully verified and order confirmed",
        orderNumber: order.orderNumber,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
