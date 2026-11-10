const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/admin/analytics
router.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: "CANCELLED" } });
    const products = await Product.find();
    const productCategoryMap = new Map();
    products.forEach((p) => productCategoryMap.set(p.id, p.category));

    let totalRevenue = 0;
    const dailyMap = new Map();
    const categoryMap = new Map();
    const topProductMap = new Map();

    orders.forEach((order) => {
      totalRevenue += order.totalAmount || 0;
      const dateStr = order.createdAt.toISOString().split("T")[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + (order.totalAmount || 0));

      (order.items || []).forEach((item) => {
        const cat = productCategoryMap.get(item.productId) || "Other";
        const prevCat = categoryMap.get(cat) || { category: cat, revenue: 0, orderCount: 0 };
        prevCat.revenue += item.subtotal || 0;
        prevCat.orderCount += 1;
        categoryMap.set(cat, prevCat);

        const prevProd = topProductMap.get(item.productName) || {
          productName: item.productName,
          unitsSold: 0,
          revenue: 0,
        };
        prevProd.unitsSold += item.quantity || 1;
        prevProd.revenue += item.subtotal || 0;
        topProductMap.set(item.productName, prevProd);
      });
    });

    const revenueTrend = Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const categorySales = Array.from(categoryMap.values());
    const topProducts = Array.from(topProductMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.json({
      success: true,
      message: "Analytics fetched",
      data: {
        revenueTrend,
        categorySales,
        topProducts,
        totalRevenue,
        totalOrders,
        averageOrderValue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
