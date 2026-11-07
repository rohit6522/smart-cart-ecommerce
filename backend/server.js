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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "CartNova Node.js REST API",
    database: "MongoDB Atlas",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/admin/products", require("./src/routes/productRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/coupons", require("./src/routes/couponRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));

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
