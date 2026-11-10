const mongoose = require("mongoose");

const DeliveryAssignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: Number, required: true, unique: true },
    orderId: { type: Number, required: true, unique: true },
    deliveryBoyId: { type: Number, required: true, index: true },
    status: { type: String, enum: ["ASSIGNED", "PICKED_UP", "DELIVERED"], default: "ASSIGNED" },
    assignedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.DeliveryAssignment ||
  mongoose.model("DeliveryAssignment", DeliveryAssignmentSchema);
