import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    await connectToDatabase();

    const query: any = { _id: id };
    // Only admins or the owner can view
    if (user.role !== "admin") {
      query.user = user._id;
    }

    const order = await Order.findOne(query).populate("user", "name email phone");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

// Order cancellation or Return request by customer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = body; // action: "cancel" | "return"

    await connectToDatabase();
    const order = await Order.findOne({ _id: id, user: user._id });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (action === "cancel") {
      if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"].includes(order.orderStatus)) {
        return NextResponse.json(
          { error: `Order cannot be cancelled in status: ${order.orderStatus}` },
          { status: 400 }
        );
      }

      order.orderStatus = "CANCELLED";
      order.cancellationReason = reason || "Customer requested cancellation";
      order.statusHistory.push({
        status: "CANCELLED",
        timestamp: new Date(),
        note: `Cancelled: ${order.cancellationReason}`,
      });

      // Restore product stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      await order.save();
      return NextResponse.json({ success: true, order }, { status: 200 });
    } else if (action === "return") {
      if (order.orderStatus !== "DELIVERED") {
        return NextResponse.json(
          { error: "Only delivered orders can be returned" },
          { status: 400 }
        );
      }

      order.refundStatus = "REQUESTED";
      order.returnReason = reason || "Customer requested return";
      order.statusHistory.push({
        status: "RETURNED",
        timestamp: new Date(),
        note: `Return requested: ${order.returnReason}`,
      });

      await order.save();
      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
