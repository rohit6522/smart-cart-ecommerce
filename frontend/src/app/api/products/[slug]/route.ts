import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    let product = await Product.findOne({ slug, isActive: true })
      .populate("category", "name slug")
      .lean();

    // Fallback search by ID if not found by slug
    if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slug)
        .populate("category", "name slug")
        .lean();
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Fetch related products in the same category
    const relatedProducts = await Product.find({
      category: (product.category as any)?._id || product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .lean();

    return NextResponse.json(
      {
        product,
        reviews,
        relatedProducts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch product details" },
      { status: 500 }
    );
  }
}
