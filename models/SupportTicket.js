import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "in-progress", "closed"], default: "open" },
  attended: { type: Boolean, default: false },  // ✅ Whether admin has attended to it
  adminReply: { type: String },                 // ✅ Optional reply message
  repliedAt: { type: Date },                    // ✅ Timestamp of reply
  createdAt: { type: Date, default: Date.now },
});

// 👇 Force collection name to "tbl_supportTicket"
export default mongoose.model("SupportTicket", supportTicketSchema, "tbl_supportTicket");
