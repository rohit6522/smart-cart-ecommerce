const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: Number, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
