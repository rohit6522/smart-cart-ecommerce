import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectToDatabase();
    const body = await req.json();

    const coupon = await Coupon.create({
      code: body.code.toUpperCase().trim(),
      description: body.description,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      minOrderAmount: Number(body.minOrderAmount) || 0,
      maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : 1000,
      firstOrderOnly: !!body.firstOrderOnly,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
