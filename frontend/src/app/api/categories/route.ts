import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();

    // Fetch product counts per category
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat._id.toString()] || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
