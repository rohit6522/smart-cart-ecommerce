import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function calculateCartTotals(cart: any) {
  let subtotal = 0;

  for (const item of cart.items) {
    subtotal += item.price * item.quantity;
  }

  let discount = 0;
  if (cart.coupon && cart.coupon.code) {
    if (cart.coupon.discountType === "percentage") {
      discount = Math.round((subtotal * cart.coupon.discountValue) / 100);
      if (cart.coupon.maxDiscountAmount && discount > cart.coupon.maxDiscountAmount) {
        discount = cart.coupon.maxDiscountAmount;
      }
    } else {
      discount = cart.coupon.discountValue;
    }
    // Cap discount at subtotal
    discount = Math.min(discount, subtotal);
  }

  // Free shipping on orders over ₹999, else ₹99
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  // 5% standard GST
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  cart.subtotal = subtotal;
  cart.discount = discount;
  cart.shipping = shipping;
  cart.tax = tax;
  cart.total = total;
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getAuthSession(req);
    const guestId = req.headers.get("x-guest-id") || req.nextUrl.searchParams.get("guestId");

    if (!session && !guestId) {
      return NextResponse.json({
        cart: { items: [], subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 },
      });
    }

    const filter = session
      ? { user: session.userId }
      : { guestId: guestId || "guest-session" };
    let cart = await Cart.findOne(filter).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ ...filter, items: [] });
    }

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getAuthSession(req);
    const body = await req.json();
    const {
      productId,
      quantity = 1,
      variantId,
      variantLabel,
      selectedSize,
      selectedColor,
      guestId,
      action = "add", // "add" | "update" | "set"
    } = body;

    const filter = session ? { user: session.userId } : { guestId: guestId || "guest-session" };

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product is no longer available" }, { status: 404 });
    }

    if (product.stock < quantity && action !== "remove") {
      return NextResponse.json(
        { error: `Only ${product.stock} items remaining in stock` },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne(filter);
    if (!cart) {
      cart = new Cart({ ...filter, items: [] });
    }

    // Find existing item in cart
    const existingIndex = cart.items.findIndex((item) => {
      const matchProduct = item.product.toString() === productId;
      const matchVariant = variantId ? item.variantId === variantId : true;
      const matchSize = selectedSize ? item.selectedSize === selectedSize : true;
      const matchColor = selectedColor ? item.selectedColor === selectedColor : true;
      return matchProduct && matchVariant && matchSize && matchColor;
    });

    if (existingIndex > -1) {
      if (action === "set") {
        if (quantity <= 0) {
          cart.items.splice(existingIndex, 1);
        } else {
          cart.items[existingIndex].quantity = quantity;
        }
      } else {
        const newQty = cart.items[existingIndex].quantity + quantity;
        if (newQty <= 0) {
          cart.items.splice(existingIndex, 1);
        } else {
          cart.items[existingIndex].quantity = newQty;
        }
      }
    } else if (quantity > 0) {
      cart.items.push({
        product: product._id,
        price: product.price,
        quantity,
        variantId,
        variantLabel,
        selectedSize,
        selectedColor,
      });
    }

    calculateCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const clearAll = searchParams.get("clear") === "true";
    const guestId = req.headers.get("x-guest-id") || searchParams.get("guestId");

    const filter = session
      ? { user: session.userId }
      : { guestId: guestId || "guest-session" };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    if (clearAll) {
      cart.items = [];
      cart.coupon = undefined;
    } else if (itemId) {
      cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
    }

    calculateCartTotals(cart);
    await cart.save();
    await cart.populate("items.product");

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete cart item" }, { status: 500 });
  }
}
