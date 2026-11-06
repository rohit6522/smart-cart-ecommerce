import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let product = null;

    if (!isNaN(Number(id))) {
      product = await ProductModel.findOne({ id: Number(id) }).lean();
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      product = await ProductModel.findById(id).lean();
    } else {
      product = await ProductModel.findOne({ slug: id }).lean();
    }

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch product",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const query = !isNaN(Number(id)) ? { id: Number(id) } : { _id: id };

    if (body.price !== undefined || body.discountPercentage !== undefined) {
      const existing = await ProductModel.findOne(query);
      if (existing) {
        const price = body.price !== undefined ? Number(body.price) : existing.price;
        const discountPercentage =
          body.discountPercentage !== undefined
            ? Number(body.discountPercentage)
            : existing.discountPercentage;
        body.discountedPrice =
          discountPercentage > 0
            ? Math.round(price * (1 - discountPercentage / 100))
            : price;
      }
    }

    const updated = await ProductModel.findOneAndUpdate(query, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update product",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const query = !isNaN(Number(id)) ? { id: Number(id) } : { _id: id };
    const deleted = await ProductModel.findOneAndDelete(query).lean();

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete product",
      },
      { status: 500 }
    );
  }
}
