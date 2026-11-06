import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    const query: Record<string, any> = { isActive: true };

    if (category) {
      query.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions: Record<string, any> = { id: 1 };
    if (sort === "price_asc") sortOptions = { price: 1 };
    if (sort === "price_desc") sortOptions = { price: -1 };
    if (sort === "rating") sortOptions = { averageRating: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };

    const products = await ProductModel.find(query).sort(sortOptions).lean();

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch products from MongoDB Atlas",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const lastProduct = await ProductModel.findOne().sort({ id: -1 });
    const nextId = (lastProduct?.id || 0) + 1;

    const discountPercentage = Number(body.discountPercentage || 0);
    const price = Number(body.price || 0);
    const discountedPrice =
      discountPercentage > 0
        ? Math.round(price * (1 - discountPercentage / 100))
        : price;

    const newProduct = await ProductModel.create({
      ...body,
      id: nextId,
      discountedPrice,
      stockQuantity: body.stockQuantity ?? body.stock ?? 10,
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    });

    return NextResponse.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create product in MongoDB Atlas",
      },
      { status: 500 }
    );
  }
}

