import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

mongoose.connect("mongodb://127.0.0.1:27017/UrDoctor");

const createUser = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.create({
    name: "Moderator",
    email: "pharmacist@gmail.com",
    password: hashedPassword,
    role: "moderator",
    isVerified: true,
  });

  console.log("Pharmacist created");
  process.exit();
};

createUser();
