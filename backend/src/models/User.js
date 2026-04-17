import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,

  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user"
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  isApproved: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: ""
  },
  bannedAt: {
    type: Date,
    default: null
  },
  violationCount: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("User", userSchema);
