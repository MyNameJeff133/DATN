import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

mongoose.connect("mongodb://127.0.0.1:27017/UrDoctor");

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin",
    isVerified: true,
  });

  console.log("Admin created");
  process.exit();
};

createAdmin();
