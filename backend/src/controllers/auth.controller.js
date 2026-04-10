import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã được sử dụng",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
    });

    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      console.error("Send verification email error:", emailError);
      return res.status(500).json({
        message: "Không gửi được email xác thực",
      });
    }

    res.json({
      message: "Đăng ký thành công. Kiểm tra email để xác thực.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.json({
      message: "Xác thực email thành công",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Vui lòng xác thực email trước khi đăng nhập",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({
      message: "Mật khẩu mới không được trùng mật khẩu cũ",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Mật khẩu xác nhận không khớp",
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công" });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email });

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({ message: "Khong co quyen truy cap" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mat khau" });
    }

    res.json({
      token: generateToken(admin),
      user: {
        id: admin._id,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Khong co quyen" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Khong co quyen" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Da xoa user" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const approveUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Khong co quyen" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Khong tim thay user" });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: "Da duyet tai khoan" });
  } catch (error) {
    res.status(500).json({ message: "Loi server" });
  }
};
