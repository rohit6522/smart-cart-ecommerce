import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectToDatabase();

    const body = await req.json();
    const {
      name,
      brand,
      category,
      description,
      shortDescription,
      price,
      compareAtPrice,
      stock,
      sku,
      images,
      variants,
      specifications,
      isFeatured,
      tags,
    } = body;

    if (!name || !brand || !category || !price || !sku) {
      return NextResponse.json(
        { error: "Name, brand, category, price, and SKU are required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const product = await Product.create({
      name,
      slug,
      brand,
      category,
      description: description || name,
      shortDescription,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock) || 0,
      sku: sku.toUpperCase(),
      images: images || [],
      variants: variants || [],
      specifications: specifications || {},
      isFeatured: !!isFeatured,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
