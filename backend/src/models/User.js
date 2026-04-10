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
    enum: ["user", "admin"],
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
  }

});
export default mongoose.model("User", userSchema);
