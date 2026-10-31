import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Payment from "@/models/Payment";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && webhookSignature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== webhookSignature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    await connectToDatabase();

    // Handle payment.captured
    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOne({ "paymentResult.razorpayOrderId": razorpayOrderId });

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = "PROCESSING";
        order.paymentResult = {
          razorpayOrderId,
          razorpayPaymentId,
          status: "PAID",
          paidAt: new Date(),
        };

        order.statusHistory.push({
          status: "PROCESSING",
          timestamp: new Date(),
          note: `Payment confirmed by Razorpay Webhook (Payment ID: ${razorpayPaymentId})`,
        });

        await order.save();

        // Stock deduction
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }

        await Payment.create({
          order: order._id,
          user: order.user,
          amount: paymentEntity.amount / 100,
          currency: paymentEntity.currency,
          status: "SUCCESS",
          method: "RAZORPAY",
          razorpayOrderId,
          razorpayPaymentId,
          rawResponse: event,
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
