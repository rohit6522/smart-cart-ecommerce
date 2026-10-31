import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const ratingParam = searchParams.get("rating");
    const inStock = searchParams.get("inStock");
    const discountOnly = searchParams.get("discountOnly");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "12", 10)));
    const featured = searchParams.get("featured");

    const query: any = { isActive: true };

    // Category filter
    if (categoryParam) {
      // Check if it's a slug or ObjectId
      let cat = await Category.findOne({ slug: categoryParam });
      if (!cat && categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
        cat = await Category.findById(categoryParam);
      }
      if (cat) {
        query.category = cat._id;
      }
    }

    // Brand filter (can be comma-separated)
    if (brandParam) {
      const brands = brandParam.split(",").map((b) => b.trim());
      query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, "i")) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (ratingParam) {
      query.rating = { $gte: Number(ratingParam) };
    }

    // In-stock filter
    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    // Discount only filter
    if (discountOnly === "true") {
      query.discountPercentage = { $gt: 0 };
    }

    // Featured filter
    if (featured === "true") {
      query.isFeatured = true;
    }

    // Text search
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
        { tags: { $in: [new RegExp(search.trim(), "i")] } },
      ];
    }

    // Sorting
    let sortObj: any = { createdAt: -1 };
    switch (sort) {
      case "price-asc":
        sortObj = { price: 1 };
        break;
      case "price-desc":
        sortObj = { price: -1 };
        break;
      case "rating":
        sortObj = { rating: -1, numReviews: -1 };
        break;
      case "popular":
        sortObj = { numReviews: -1, rating: -1 };
        break;
      case "discount":
        sortObj = { discountPercentage: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Aggregate available brands and price bounds for dynamic filter sidebar
    const allBrands = await Product.distinct("brand", { isActive: true });

    return NextResponse.json(
      {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          limit,
        },
        availableBrands: allBrands,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
