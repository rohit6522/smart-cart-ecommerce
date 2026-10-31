import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectToDatabase();

    const users = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Attach order count and total spend
    const customerStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: "CANCELLED" } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
        },
      },
    ]);

    const statsMap: Record<string, { totalOrders: number; totalSpent: number }> = {};
    customerStats.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalOrders: s.totalOrders,
        totalSpent: s.totalSpent,
      };
    });

    const customers = users.map((u) => ({
      ...u,
      totalOrders: statsMap[u._id.toString()]?.totalOrders || 0,
      totalSpent: statsMap[u._id.toString()]?.totalSpent || 0,
    }));

    return NextResponse.json({ customers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
