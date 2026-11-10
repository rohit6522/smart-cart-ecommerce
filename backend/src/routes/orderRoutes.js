const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { authenticate, requireRole } = require("../middleware/auth");

const userOrderRouter = express.Router();
const adminOrderRouter = express.Router();

function formatOrder(order) {
  const obj = order.toObject ? order.toObject() : { ...order };
  const status = obj.status;
  obj.canCancel = status === "PENDING" || status === "CONFIRMED";
  obj.canReturn = status === "DELIVERED";
  return obj;
}

async function createNotification(userId, title, message, orderId = null) {
  try {
    const last = await Notification.findOne().sort({ id: -1 });
    const nextId = (last && last.id ? last.id : 0) + 1;
    await Notification.create({
      id: nextId,
      userId,
      title,
      message,
      orderId,
      isRead: false,
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}

// ---------- User Order Routes (/api/user/orders) ----------

// POST /api/user/orders/checkout
userOrderRouter.post("/checkout", authenticate, async (req, res) => {
  try {
    const { deliveryAddress, razorpayOrderId, razorpayPaymentId, couponCode } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    const user = await User.findOne({ userId: req.user.userId });
    const subtotal = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && subtotal >= (coupon.minOrderValue || 0)) {
        if (coupon.discountType === "PERCENTAGE" || coupon.discountType === "percentage") {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
          }
        } else {
          discountAmount = coupon.discountAmount || coupon.discountValue || 0;
        }
        appliedCoupon = coupon.code;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const nextOrderId = (lastOrder && lastOrder.orderId ? lastOrder.orderId : 1000) + 1;

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtAdd,
      subtotal: item.subtotal,
    }));

    const newOrder = await Order.create({
      orderId: nextOrderId,
      userId: req.user.userId,
      customerName: user ? user.name : req.user.name || "Customer",
      customerPhone: user ? user.phone : "",
      status: "CONFIRMED",
      totalAmount,
      deliveryAddress,
      items: orderItems,
      paymentStatus: razorpayPaymentId ? "PAID" : "COD / CONFIRMED",
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      couponCode: appliedCoupon,
      discountAmount,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    await createNotification(
      req.user.userId,
      "Order Confirmed",
      `Your order #${nextOrderId} for ₹${totalAmount} has been confirmed.`,
      nextOrderId
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: formatOrder(newOrder),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/user/orders
userOrderRouter.get("/", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "Orders fetched",
      data: orders.map(formatOrder),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/user/orders/:orderId
userOrderRouter.get("/:orderId", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: Number(req.params.orderId),
      userId: req.user.userId,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order details", data: formatOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/orders/:orderId/cancel
userOrderRouter.put("/:orderId/cancel", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: Number(req.params.orderId),
      userId: req.user.userId,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be cancelled at this stage" });
    }

    order.status = "CANCELLED";
    order.cancellationReason = req.body.reason || "Cancelled by customer";
    await order.save();

    await createNotification(
      req.user.userId,
      "Order Cancelled",
      `Your order #${order.orderId} has been cancelled.`,
      order.orderId
    );

    res.json({ success: true, message: "Order cancelled", data: formatOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/orders/:orderId/return
userOrderRouter.put("/:orderId/return", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: Number(req.params.orderId),
      userId: req.user.userId,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status !== "DELIVERED") {
      return res
        .status(400)
        .json({ success: false, message: "Only delivered orders can be returned" });
    }

    order.status = "RETURN_REQUESTED";
    order.returnReason = req.body.reason || "Customer return request";
    order.returnRequestedAt = new Date();
    await order.save();

    res.json({ success: true, message: "Return requested", data: formatOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- Admin Order Routes (/api/admin/orders) ----------

// GET /api/admin/orders
adminOrderRouter.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      message: "All orders fetched",
      data: orders.map(formatOrder),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/orders/export
adminOrderRouter.get("/export", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const header = "OrderID,Customer,Status,TotalAmount,PaymentStatus,CreatedAt\n";
    const rows = orders
      .map(
        (o) =>
          `${o.orderId},"${(o.customerName || "").replace(/"/g, '""')}",${o.status},${o.totalAmount},${o.paymentStatus},${o.createdAt.toISOString()}`
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders-export.csv");
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/orders/:orderId/status
adminOrderRouter.put("/:orderId/status", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: Number(req.params.orderId) });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
    }
    await order.save();

    await createNotification(
      order.userId,
      "Order Status Updated",
      `Your order #${order.orderId} is now ${status.replace(/_/g, " ")}.`,
      order.orderId
    );

    res.json({ success: true, message: "Order status updated", data: formatOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/orders/:orderId/resolve-return
adminOrderRouter.put(
  "/:orderId/resolve-return",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const approve = req.query.approve === "true";
      const order = await Order.findOne({ orderId: Number(req.params.orderId) });
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      order.status = approve ? "RETURNED" : "RETURN_REJECTED";
      await order.save();

      await createNotification(
        order.userId,
        approve ? "Return Approved" : "Return Rejected",
        `Your return request for order #${order.orderId} was ${approve ? "approved" : "rejected"}.`,
        order.orderId
      );

      res.json({ success: true, message: "Return resolved", data: formatOrder(order) });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = { userOrderRouter, adminOrderRouter };
