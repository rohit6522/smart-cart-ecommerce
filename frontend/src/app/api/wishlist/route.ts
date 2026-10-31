import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectToDatabase();

    let wishlist = await Wishlist.findOne({ user: user._id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user._id, products: [] });
    }

    return NextResponse.json({ wishlist: wishlist.products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch wishlist" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectToDatabase();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ user: user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: user._id, products: [] });
    }

    const index = wishlist.products.findIndex((p: any) => p.toString() === productId);
    let inWishlist = false;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      inWishlist = false;
    } else {
      wishlist.products.push(productId);
      inWishlist = true;
    }

    await wishlist.save();
    await wishlist.populate("products");

    return NextResponse.json(
      {
        success: true,
        inWishlist,
        wishlist: wishlist.products,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update wishlist" }, { status: 500 });
  }
}
