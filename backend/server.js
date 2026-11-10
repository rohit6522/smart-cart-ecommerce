const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins (Vercel, localhost, etc.)
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "CartNova Node.js REST API",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString(),
  });
});

// Route Imports
const { couponRouter, userCouponRouter, adminCouponRouter } = require("./src/routes/couponRoutes");
const { userOrderRouter, adminOrderRouter } = require("./src/routes/orderRoutes");
const { adminDeliveryRouter, deliveryRouter } = require("./src/routes/deliveryRoutes");
const { userSupportRouter, adminSupportRouter } = require("./src/routes/supportRoutes");
const { publicReviewRouter, userReviewRouter } = require("./src/routes/reviewRoutes");

// Public & Auth Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/products", publicReviewRouter);
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/coupons", couponRouter);

// User Routes
app.use("/api/user/cart", require("./src/routes/cartRoutes"));
app.use("/api/user/wishlist", require("./src/routes/wishlistRoutes"));
app.use("/api/user/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/user/orders", userOrderRouter);
app.use("/api/user/support", userSupportRouter);
app.use("/api/user/products", userReviewRouter);
app.use("/api/user", userCouponRouter);
app.use("/api/user", require("./src/routes/userProfileRoutes"));

// Admin Routes
app.use("/api/admin/products", require("./src/routes/productRoutes"));
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/coupons", adminCouponRouter);
app.use("/api/admin/support", adminSupportRouter);
app.use("/api/admin/analytics", require("./src/routes/analyticsRoutes"));
app.use("/api/admin", adminDeliveryRouter);

// Delivery Agent Routes
app.use("/api/delivery", deliveryRouter);

// App Info
app.get("/api", (req, res) => {
  res.json({
    name: "CartNova (TROSTO) E-Commerce Backend",
    version: "2.0.0",
    docs: "/api/docs",
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[CartNova Node.js Server] listening on port ${PORT}`);
});

module.exports = app;
