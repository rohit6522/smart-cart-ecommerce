const mongoose = require("mongoose");

const SupportTicketSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "RESOLVED"], default: "OPEN" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
