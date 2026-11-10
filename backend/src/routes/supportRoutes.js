const express = require("express");
const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");
const { authenticate, requireRole } = require("../middleware/auth");

const userSupportRouter = express.Router();
const adminSupportRouter = express.Router();

// POST /api/user/support
userSupportRouter.post("/", authenticate, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const user = await User.findOne({ userId: req.user.userId });
    const last = await SupportTicket.findOne().sort({ id: -1 });
    const nextId = (last && last.id ? last.id : 0) + 1;

    const ticket = await SupportTicket.create({
      id: nextId,
      userId: req.user.userId,
      userName: user ? user.name : req.user.name || "User",
      userEmail: user ? user.email : req.user.email,
      subject,
      message,
      status: "OPEN",
    });

    res.status(201).json({ success: true, message: "Ticket submitted", data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/user/support/my-tickets
userSupportRouter.get("/my-tickets", authenticate, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, message: "Tickets fetched", data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/support/tickets
adminSupportRouter.get("/tickets", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json({ success: true, message: "All tickets fetched", data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/support/tickets/:id/resolve
adminSupportRouter.put(
  "/tickets/:id/resolve",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const ticket = await SupportTicket.findOneAndUpdate(
        { id: Number(req.params.id) },
        { status: "RESOLVED" },
        { new: true }
      );
      if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
      res.json({ success: true, message: "Ticket resolved", data: ticket });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = { userSupportRouter, adminSupportRouter };
