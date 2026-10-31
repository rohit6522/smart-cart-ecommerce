import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import { getAuthSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getAuthSession(req);
    const body = await req.json();
    const { code, cartSubtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter a coupon code" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
    }

    // Expiry check
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This coupon code has expired" }, { status: 400 });
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    // Min order amount check
    if (cartSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString(
            "en-IN"
          )} required for this coupon`,
        },
        { status: 400 }
      );
    }

    // First order only check
    if (coupon.firstOrderOnly && session) {
      const pastOrders = await Order.countDocuments({
        user: session.userId,
        orderStatus: { $ne: "CANCELLED" },
      });
      if (pastOrders > 0) {
        return NextResponse.json(
          { error: "This coupon is valid only on your first order" },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((cartSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);

    return NextResponse.json(
      {
        success: true,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
