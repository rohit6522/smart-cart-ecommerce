const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

const publicReviewRouter = express.Router();
const userReviewRouter = express.Router();

// GET /api/products/:productId/reviews
publicReviewRouter.get("/:productId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: Number(req.params.productId) }).sort({
      createdAt: -1,
    });
    res.json({ success: true, message: "Reviews fetched", data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/user/products/:productId/reviews
userReviewRouter.post("/:productId/reviews", authenticate, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { rating, comment } = req.body;

    const last = await Review.findOne().sort({ id: -1 });
    const nextId = (last && last.id ? last.id : 0) + 1;

    const review = await Review.create({
      id: nextId,
      productId,
      userId: req.user.userId,
      userName: req.user.name || "Customer",
      rating: Number(rating),
      comment,
    });

    // Update product rating stats
    const allReviews = await Review.find({ productId });
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);
    await Product.findOneAndUpdate(
      { id: productId },
      {
        averageRating: Number(avg.toFixed(1)),
        rating: Number(avg.toFixed(1)),
        totalReviews: allReviews.length,
        numReviews: allReviews.length,
      }
    );

    res.status(201).json({ success: true, message: "Review submitted", data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { publicReviewRouter, userReviewRouter };
