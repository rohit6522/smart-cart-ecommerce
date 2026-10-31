import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectToDatabase();

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, user: user._id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.isPaid) {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";

    // Amount in Indian paise (1 INR = 100 paise)
    const amountInPaise = Math.round(order.totalPrice * 100);

    let razorpayOrder;

    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes("placeholder")
    ) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${order.orderNumber.replace(/-/g, "_")}`,
        notes: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: user._id.toString(),
        },
      });
    } else {
      // Reliable mock Razorpay order for development/test mode
      razorpayOrder = {
        id: `order_test_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${order.orderNumber}`,
        status: "created",
      };
    }

    // Save the Razorpay Order ID on our internal Order
    order.paymentResult = {
      razorpayOrderId: razorpayOrder.id,
      status: "PENDING",
    };
    await order.save();

    return NextResponse.json(
      {
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: keyId,
        orderNumber: order.orderNumber,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone || order.shippingAddress.phone,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
