const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

// GET /api/user/wishlist
router.get("/", authenticate, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user.userId });
    const productIds = items.map((w) => w.productId);
    const products = await Product.find({ id: { $in: productIds } });

    const productMap = new Map();
    products.forEach((p) => productMap.set(p.id, p));

    const result = items
      .map((w) => {
        const product = productMap.get(w.productId);
        if (!product) return null;
        return {
          wishlistId: w.wishlistId,
          product,
        };
      })
      .filter(Boolean);

    res.json({ success: true, message: "Wishlist fetched", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/user/wishlist/:productId
router.post("/:productId", authenticate, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const existing = await Wishlist.findOne({ userId: req.user.userId, productId });
    if (!existing) {
      const last = await Wishlist.findOne().sort({ wishlistId: -1 });
      const nextId = (last && last.wishlistId ? last.wishlistId : 0) + 1;
      await Wishlist.create({
        wishlistId: nextId,
        userId: req.user.userId,
        productId,
      });
    }
    res.json({ success: true, message: "Added to wishlist", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/user/wishlist/:productId
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    await Wishlist.deleteOne({ userId: req.user.userId, productId });
    res.json({ success: true, message: "Removed from wishlist", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
