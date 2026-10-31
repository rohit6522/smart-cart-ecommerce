import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectToDatabase();

    // 1. Total revenue & orders count
    const revenueAggregation = await Order.aggregate([
      {
        $match: {
          $or: [{ isPaid: true }, { paymentMethod: "COD", orderStatus: "DELIVERED" }],
          orderStatus: { $ne: "CANCELLED" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const averageOrderValue =
      revenueAggregation[0]?.totalOrders > 0
        ? Math.round(totalRevenue / revenueAggregation[0].totalOrders)
        : 0;

    // 2. Low-stock products (< 15 units)
    const lowStockProducts = await Product.find({ stock: { $lte: 15 }, isActive: true })
      .select("name sku price stock images")
      .limit(6)
      .lean();

    // 3. Recent 8 orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // 4. Sales revenue trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          orderStatus: { $ne: "CANCELLED" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format dates for front-end charts
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const trend = dailyTrends.find((t) => t._id === dateKey);

      chartData.push({
        date: dayName,
        revenue: trend ? trend.revenue : 0,
        orders: trend ? trend.orders : 0,
      });
    }

    return NextResponse.json(
      {
        metrics: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          averageOrderValue,
        },
        chartData,
        lowStockProducts,
        recentOrders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
