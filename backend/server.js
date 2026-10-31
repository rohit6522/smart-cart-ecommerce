const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
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
