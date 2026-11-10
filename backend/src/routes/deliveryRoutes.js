const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const DeliveryAssignment = require("../models/DeliveryAssignment");
const Notification = require("../models/Notification");
const { authenticate, requireRole } = require("../middleware/auth");

const adminDeliveryRouter = express.Router();
const deliveryRouter = express.Router();

const PER_DELIVERY_FEE = 50;

async function formatAssignment(assignment) {
  const order = await Order.findOne({ orderId: assignment.orderId });
  return {
    assignmentId: assignment.assignmentId,
    orderId: assignment.orderId,
    status: assignment.status,
    assignedAt: assignment.assignedAt,
    deliveredAt: assignment.deliveredAt,
    orderTotal: order ? order.totalAmount : 0,
    deliveryAddress: order ? order.deliveryAddress : "",
    customerName: order ? order.customerName : "Customer",
    customerPhone: order ? order.customerPhone : "",
  };
}

// ---------- Admin Delivery Routes (mounted under /api/admin) ----------

// GET /api/admin/delivery-boys
adminDeliveryRouter.get(
  "/delivery-boys",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const boys = await User.find({ role: "DELIVERY_BOY" }).select(
        "userId name phone email"
      );
      const result = boys.map((b) => ({
        id: b.userId,
        name: b.name,
        phone: b.phone || "N/A",
        email: b.email,
      }));
      res.json({ success: true, message: "Delivery agents fetched", data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/admin/delivery/assign
adminDeliveryRouter.post(
  "/delivery/assign",
  authenticate,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { orderId, deliveryBoyId } = req.body;
      const order = await Order.findOne({ orderId: Number(orderId) });
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });

      const boy = await User.findOne({ userId: Number(deliveryBoyId), role: "DELIVERY_BOY" });
      if (!boy) return res.status(404).json({ success: false, message: "Delivery boy not found" });

      let assignment = await DeliveryAssignment.findOne({ orderId: Number(orderId) });
      if (assignment) {
        assignment.deliveryBoyId = Number(deliveryBoyId);
        assignment.status = "ASSIGNED";
        assignment.assignedAt = new Date();
        await assignment.save();
      } else {
        const last = await DeliveryAssignment.findOne().sort({ assignmentId: -1 });
        const nextId = (last && last.assignmentId ? last.assignmentId : 0) + 1;
        assignment = await DeliveryAssignment.create({
          assignmentId: nextId,
          orderId: Number(orderId),
          deliveryBoyId: Number(deliveryBoyId),
          status: "ASSIGNED",
        });
      }

      order.deliveryBoyId = boy.userId;
      order.deliveryBoyName = boy.name;
      order.deliveryBoyPhone = boy.phone;
      order.status = "OUT_FOR_DELIVERY";
      await order.save();

      const data = await formatAssignment(assignment);
      res.json({ success: true, message: "Delivery assigned", data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ---------- Delivery Agent Routes (mounted under /api/delivery) ----------

// GET /api/delivery/my-deliveries
deliveryRouter.get(
  "/my-deliveries",
  authenticate,
  requireRole("DELIVERY_BOY"),
  async (req, res) => {
    try {
      const assignments = await DeliveryAssignment.find({
        deliveryBoyId: req.user.userId,
      }).sort({ assignedAt: -1 });

      const result = await Promise.all(assignments.map(formatAssignment));
      res.json({ success: true, message: "Deliveries fetched", data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/delivery/:assignmentId/status
deliveryRouter.put(
  "/:assignmentId/status",
  authenticate,
  requireRole("DELIVERY_BOY"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const assignment = await DeliveryAssignment.findOne({
        assignmentId: Number(req.params.assignmentId),
        deliveryBoyId: req.user.userId,
      });

      if (!assignment) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      assignment.status = status;
      if (status === "DELIVERED") {
        assignment.deliveredAt = new Date();
      }
      await assignment.save();

      const order = await Order.findOne({ orderId: assignment.orderId });
      if (order) {
        if (status === "PICKED_UP") order.status = "OUT_FOR_DELIVERY";
        if (status === "DELIVERED") {
          order.status = "DELIVERED";
          order.deliveredAt = new Date();
        }
        await order.save();

        if (status === "DELIVERED") {
          try {
            const lastNotif = await Notification.findOne().sort({ id: -1 });
            const nextNotifId = (lastNotif && lastNotif.id ? lastNotif.id : 0) + 1;
            await Notification.create({
              id: nextNotifId,
              userId: order.userId,
              title: "Order Delivered!",
              message: `Your order #${order.orderId} has been delivered.`,
              orderId: order.orderId,
              isRead: false,
            });
          } catch {}
        }
      }

      const data = await formatAssignment(assignment);
      res.json({ success: true, message: "Delivery status updated", data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/delivery/earnings
deliveryRouter.get(
  "/earnings",
  authenticate,
  requireRole("DELIVERY_BOY"),
  async (req, res) => {
    try {
      const delivered = await DeliveryAssignment.find({
        deliveryBoyId: req.user.userId,
        status: "DELIVERED",
      });

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const deliveriesToday = delivered.filter(
        (d) => d.deliveredAt && new Date(d.deliveredAt) >= startOfToday
      ).length;
      const deliveriesThisMonth = delivered.filter(
        (d) => d.deliveredAt && new Date(d.deliveredAt) >= startOfMonth
      ).length;
      const totalDeliveries = delivered.length;

      res.json({
        success: true,
        message: "Earnings fetched",
        data: {
          totalDeliveries,
          deliveriesToday,
          deliveriesThisMonth,
          totalEarnings: totalDeliveries * PER_DELIVERY_FEE,
          earningsToday: deliveriesToday * PER_DELIVERY_FEE,
          earningsThisMonth: deliveriesThisMonth * PER_DELIVERY_FEE,
          perDeliveryFee: PER_DELIVERY_FEE,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = { adminDeliveryRouter, deliveryRouter };
