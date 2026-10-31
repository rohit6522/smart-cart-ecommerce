import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id).populate("user", "name email phone");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, trackingNumber, deliveryPartnerName, note, refundStatus } = body;

    await connectToDatabase();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "DELIVERED") {
        order.deliveredAt = new Date();
        if (order.paymentMethod === "COD") {
          order.isPaid = true;
          order.paidAt = new Date();
          if (order.paymentResult) {
            order.paymentResult.status = "PAID";
          }
        }
      }

      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date(),
        note: note || `Order status updated to ${orderStatus} by administrator`,
      });
    }

    if (trackingNumber || deliveryPartnerName) {
      order.deliveryPartner = {
        name: deliveryPartnerName || order.deliveryPartner?.name || "CartNova Express",
        trackingNumber: trackingNumber || order.deliveryPartner?.trackingNumber,
      };
    }

    if (refundStatus) {
      order.refundStatus = refundStatus;
      if (refundStatus === "PROCESSED") {
        // Return products back to inventory
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    await order.save();
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
