const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Cart = require("../models/Cart");
const { authenticate } = require("../middleware/auth");

// ---------- Addresses ----------

// GET /api/user/addresses
router.get("/addresses", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "Addresses fetched", data: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/user/addresses
router.post("/addresses", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addresses = user.addresses || [];
    const nextId = addresses.length > 0 ? Math.max(...addresses.map((a) => a.id || 0)) + 1 : 1;

    if (req.body.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    const newAddress = {
      id: nextId,
      label: req.body.label || "Home",
      fullName: req.body.fullName,
      phone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      isDefault: addresses.length === 0 ? true : Boolean(req.body.isDefault),
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ success: true, message: "Address added", data: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/addresses/:id
router.put("/addresses/:id", authenticate, async (req, res) => {
  try {
    const addressId = Number(req.params.id);
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const idx = user.addresses.findIndex((a) => Number(a.id) === addressId);
    if (idx === -1) return res.status(404).json({ success: false, message: "Address not found" });

    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(user.addresses[idx], req.body);
    await user.save();

    res.json({ success: true, message: "Address updated", data: user.addresses[idx] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/user/addresses/:id
router.delete("/addresses/:id", authenticate, async (req, res) => {
  try {
    const addressId = Number(req.params.id);
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.addresses = user.addresses.filter((a) => Number(a.id) !== addressId);
    await user.save();

    res.json({ success: true, message: "Address deleted", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/addresses/:id/set-default
router.put("/addresses/:id/set-default", authenticate, async (req, res) => {
  try {
    const addressId = Number(req.params.id);
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let found = null;
    user.addresses.forEach((a) => {
      if (Number(a.id) === addressId) {
        a.isDefault = true;
        found = a;
      } else {
        a.isDefault = false;
      }
    });

    if (!found) return res.status(404).json({ success: false, message: "Address not found" });
    await user.save();

    res.json({ success: true, message: "Default address set", data: found });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- Referral & Profile Photo ----------

// GET /api/user/referral
router.get("/referral", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const totalReferred = await User.countDocuments({ referredBy: user.referralCode });
    res.json({
      success: true,
      message: "Referral info",
      data: {
        referralCode: user.referralCode || `SMART${user.userId}`,
        totalReferred,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/user/profile-photo
router.get("/profile-photo", authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    res.json({ success: true, message: "Profile photo", data: user ? user.profilePhoto : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/profile-photo
router.put("/profile-photo", authenticate, async (req, res) => {
  try {
    const { profilePhoto } = req.body;
    const user = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { profilePhoto },
      { new: true }
    );
    res.json({ success: true, message: "Profile photo updated", data: user.profilePhoto });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- Payment Order Creation (Razorpay / Mock Fallback) ----------

// POST /api/user/payment/create-order
router.post("/payment/create-order", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    const amount = cart
      ? cart.items.reduce((sum, i) => sum + i.subtotal, 0) * 100
      : 10000;

    res.json({
      success: true,
      message: "Payment order created",
      data: {
        razorpayOrderId: `order_${Date.now()}`,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_demo_key",
        amount,
        currency: "INR",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
