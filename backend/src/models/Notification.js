// models/Notification.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  isRead: { type: Boolean, default: false }
});

export default mongoose.model("Notification", schema);
