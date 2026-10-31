import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const OrderCreateSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(4),
    country: z.string().default("India"),
  }),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectToDatabase();

    const body = await req.json();
    const parsed = OrderCreateSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues?.[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid order input" },
        { status: 400 }
      );
    }

    const { shippingAddress, paymentMethod, couponCode } = parsed.data;

    // Fetch user's cart
    const cart = await Cart.findOne({ user: user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    }

    // Verify product availability and prices strictly from database
    const orderItems: any[] = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product "${item.product.name}" is no longer available` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} available.` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.images[0]?.url || "",
        price: product.price,
        quantity: item.quantity,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      });
    }

    // Server-side coupon verification
    let discountAmount = 0;
    let validatedCoupon = null;
    if (couponCode) {
      validatedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (validatedCoupon && itemsPrice >= validatedCoupon.minOrderAmount) {
        if (validatedCoupon.discountType === "percentage") {
          discountAmount = Math.round((itemsPrice * validatedCoupon.discountValue) / 100);
          if (validatedCoupon.maxDiscountAmount && discountAmount > validatedCoupon.maxDiscountAmount) {
            discountAmount = validatedCoupon.maxDiscountAmount;
          }
        } else {
          discountAmount = validatedCoupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, itemsPrice);
      }
    }

    // Server-side shipping and tax calculations
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxableAmount = Math.max(0, itemsPrice - discountAmount);
    const taxPrice = Math.round(taxableAmount * 0.05);
    const totalPrice = taxableAmount + shippingPrice + taxPrice;

    // Generate unique order number: TN-YYYYMMDD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderNumber = `TN-${dateStr}-${randomSuffix}`;

    const newOrder = await Order.create({
      user: user._id,
      orderNumber,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      couponCode: validatedCoupon ? validatedCoupon.code : undefined,
      totalPrice,
      isPaid: false,
      orderStatus: "PLACED",
      statusHistory: [
        {
          status: "PLACED",
          timestamp: new Date(),
          note: paymentMethod === "COD" ? "Order placed with Cash on Delivery" : "Order initiated via Razorpay",
        },
      ],
      paymentResult: {
        status: "PENDING",
      },
    });

    // If COD, deduct inventory and clear cart immediately
    if (paymentMethod === "COD") {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
      cart.items = [];
      cart.coupon = undefined;
      cart.subtotal = 0;
      cart.discount = 0;
      cart.total = 0;
      await cart.save();

      if (validatedCoupon) {
        await Coupon.findByIdAndUpdate(validatedCoupon._id, { $inc: { usedCount: 1 } });
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderId: newOrder._id.toString(),
        orderNumber: newOrder.orderNumber,
        totalPrice: newOrder.totalPrice,
        paymentMethod: newOrder.paymentMethod,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectToDatabase();

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 401 });
  }
}
