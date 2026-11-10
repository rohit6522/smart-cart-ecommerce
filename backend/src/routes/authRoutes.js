const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "smart_cart_jwt_secret_key_2026";

// In-memory OTP storage for demo / admin 2FA
const otpStore = new Map();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, role, referralCode } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const lastUser = await User.findOne().sort({ userId: -1 });
    const nextUserId = (lastUser && lastUser.userId ? lastUser.userId : 0) + 1;

    const user = await User.create({
      userId: nextUserId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: role || "USER",
      referralCode: referralCode || `SMART${Math.floor(1000 + Math.random() * 9000)}`,
      addresses: address
        ? [
            {
              id: 1,
              fullName: name,
              phone: phone || "",
              street: address,
              city: "City",
              state: "State",
              zip: "000000",
              isDefault: true,
            },
          ]
        : [],
    });

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Admin role requires 2FA OTP
    if (user.role === "ADMIN") {
      const generatedOtp = "123456"; // Default demo OTP or random
      otpStore.set(user.email, generatedOtp);
      console.log(`[Admin OTP generated for ${user.email}]: ${generatedOtp}`);

      return res.json({
        success: true,
        data: {
          message: "OTP sent to admin email",
          email: user.email,
          requiresOtp: true,
          role: user.role,
        },
      });
    }

    // Customer or Delivery Boy - direct login
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        message: "Login successful",
        email: user.email,
        requiresOtp: false,
        token,
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = otpStore.get(email);

    if (otp !== "123456" && (!storedOtp || storedOtp !== otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    otpStore.delete(email);

    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        token,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email" });
    }

    const generatedOtp = "123456";
    otpStore.set(normalizedEmail, generatedOtp);
    console.log(`[Password Reset OTP for ${normalizedEmail}]: ${generatedOtp}`);

    res.json({
      success: true,
      data: {
        message: "Password reset OTP sent (use 123456 for demo)",
        email: normalizedEmail,
        requiresOtp: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();
    const storedOtp = otpStore.get(normalizedEmail);

    if (otp !== "123456" && (!storedOtp || storedOtp !== otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    otpStore.delete(normalizedEmail);
    res.json({ success: true, message: "Password updated successfully", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

