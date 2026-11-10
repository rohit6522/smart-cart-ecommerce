const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticate } = require("../middleware/auth");

// GET /api/user/notifications
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, message: "Notifications fetched", data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/user/notifications/unread-count
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
    });
    res.json({ success: true, message: "Unread count", data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/notifications/mark-read
router.put("/mark-read", authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: "Marked as read", data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
