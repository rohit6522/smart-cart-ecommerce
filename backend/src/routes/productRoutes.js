const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Get all active products
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isActive: true };

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

    let sortOptions = { id: 1 };
    if (sort === "price_asc") sortOptions = { price: 1 };
    if (sort === "price_desc") sortOptions = { price: -1 };
    if (sort === "rating") sortOptions = { averageRating: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };

    const products = await Product.find(query).sort(sortOptions);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error fetching products" });
  }
});

// GET /api/products/:id - Get product by numeric id, slug, or MongoDB ObjectId
router.get("/:id", async (req, res) => {
  try {
    const param = req.params.id;
    let product = null;

    if (!isNaN(param)) {
      product = await Product.findOne({ id: Number(param) });
    }

    if (!product && mongoose.Types.ObjectId.isValid(param)) {
      product = await Product.findById(param);
    }

    if (!product) {
      product = await Product.findOne({ slug: param });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Server error fetching product" });
  }
});

// POST /api/admin/products - Create product (Admin)
router.post("/", async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = (lastProduct && lastProduct.id ? lastProduct.id : 0) + 1;

    const payload = { ...req.body, id: req.body.id || nextId };
    if (!payload.slug && payload.name) {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    const created = await Product.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/products/:id - Update product (Admin)
router.put("/:id", async (req, res) => {
  try {
    const param = req.params.id;
    let query = {};
    if (!isNaN(param)) {
      query = { id: Number(param) };
    } else if (mongoose.Types.ObjectId.isValid(param)) {
      query = { _id: param };
    } else {
      query = { slug: param };
    }

    const updated = await Product.findOneAndUpdate(query, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/products/:id - Delete product (Admin)
router.delete("/:id", async (req, res) => {
  try {
    const param = req.params.id;
    let query = {};
    if (!isNaN(param)) {
      query = { id: Number(param) };
    } else if (mongoose.Types.ObjectId.isValid(param)) {
      query = { _id: param };
    } else {
      query = { slug: param };
    }

    const deleted = await Product.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
