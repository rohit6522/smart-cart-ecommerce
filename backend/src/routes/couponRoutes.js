const express = require("express");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { authenticate, requireRole } = require("../middleware/auth");

const couponRouter = express.Router();
const userCouponRouter = express.Router();
const adminCouponRouter = express.Router();

function formatCoupon(c) {
  const obj = c.toObject ? c.toObject() : { ...c };
  const isPerc = obj.discountType === "percentage" || obj.discountType === "PERCENTAGE";
  return {
    id: obj.id,
    code: obj.code,
    description: obj.description,
    discountType: isPerc ? "PERCENTAGE" : "FLAT",
    discountValue: obj.discountValue,
    minOrderValue: obj.minOrderValue || 0,
    firstOrderOnly: Boolean(obj.firstOrderOnly),
    active: obj.active !== undefined ? obj.active : obj.isActive !== false,
    expiresAt: obj.expiresAt || null,
  };
}

async function applyCouponLogic(userId, code) {
  if (!code) {
    throw { status: 400, message: "Coupon code is required" };
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    $or: [{ isActive: true }, { active: true }],
  });

  if (!coupon) {
    throw { status: 404, message: "Invalid or expired coupon code" };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw { status: 400, message: "This coupon has expired" };
  }

  if (coupon.firstOrderOnly && userId) {
    const orderCount = await Order.countDocuments({ userId });
    if (orderCount > 0) {
      throw { status: 400, message: "This coupon is valid on first order only" };
    }
  }

  let cartTotal = 0;
  if (userId) {
    const cart = await Cart.findOne({ userId });
    if (cart && cart.items) {
      cartTotal = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
    }
  }

  if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
    throw {
      status: 400,
      message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
    };
  }

  const isPerc = coupon.discountType === "percentage" || coupon.discountType === "PERCENTAGE";
  let discountAmount = 0;
  if (isPerc) {
    discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue || coupon.discountAmount || 0;
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return {
    code: coupon.code,
    discountAmount,
    cartTotal,
    finalTotal,
  };
}

// Public/Legacy endpoints (/api/coupons)
couponRouter.get("/my", async (req, res) => {
  try {
    const coupons = await Coupon.find({ $or: [{ isActive: true }, { active: true }] });
    res.json({ success: true, message: "Coupons loaded", data: coupons.map(formatCoupon) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

couponRouter.post("/apply", async (req, res) => {
  try {
    const result = await applyCouponLogic(null, req.body.code);
    res.json({ success: true, message: "Coupon applied", data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// User endpoints (mounted under /api/user)
userCouponRouter.get("/coupons/my", authenticate, async (req, res) => {
  try {
    const coupons = await Coupon.find({ $or: [{ isActive: true }, { active: true }] });
    res.json({ success: true, message: "Coupons loaded", data: coupons.map(formatCoupon) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userCouponRouter.post("/coupon/apply", authenticate, async (req, res) => {
  try {
    const result = await applyCouponLogic(req.user.userId, req.body.code);
    res.json({ success: true, message: "Coupon applied", data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// Admin endpoints (mounted under /api/admin/coupons)
adminCouponRouter.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, message: "Coupons loaded", data: coupons.map(formatCoupon) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

adminCouponRouter.post("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const last = await Coupon.findOne().sort({ id: -1 });
    const nextId = (last && last.id ? last.id : 0) + 1;

    const payload = {
      ...req.body,
      id: nextId,
      isActive: req.body.active !== undefined ? req.body.active : true,
      active: req.body.active !== undefined ? req.body.active : true,
    };

    const created = await Coupon.create(payload);
    res.status(201).json({ success: true, message: "Coupon created", data: formatCoupon(created) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

adminCouponRouter.put("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const couponId = Number(req.params.id);
    const updateData = {
      ...req.body,
    };
    if (req.body.active !== undefined) {
      updateData.isActive = req.body.active;
    }

    const updated = await Coupon.findOneAndUpdate({ id: couponId }, updateData, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Coupon not found" });

    res.json({ success: true, message: "Coupon updated", data: formatCoupon(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

adminCouponRouter.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const couponId = Number(req.params.id);
    const deleted = await Coupon.findOneAndDelete({ id: couponId });
    if (!deleted) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { couponRouter, userCouponRouter, adminCouponRouter };
