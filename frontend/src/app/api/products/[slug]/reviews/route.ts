import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";

const ReviewInputSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { slug } = await params;
    await connectToDatabase();

    const product = await Product.findOne({ slug });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = ReviewInputSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { rating, title, comment } = parsed.data;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: product._id,
      user: user._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this product" },
        { status: 409 }
      );
    }

    // Check verified purchase
    const orderWithProduct = await Order.findOne({
      user: user._id,
      "orderItems.productId": product._id,
      orderStatus: "DELIVERED",
    });

    const newReview = await Review.create({
      product: product._id,
      user: user._id,
      userName: user.name,
      userAvatar: user.avatar || "",
      rating,
      title: title || "",
      comment,
      isVerifiedPurchase: !!orderWithProduct,
    });

    // Recalculate average rating and review count
    const allReviews = await Review.find({ product: product._id });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Number(avgRating.toFixed(1));
    product.numReviews = allReviews.length;
    await product.save();

    return NextResponse.json(
      { success: true, review: newReview, rating: product.rating },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
