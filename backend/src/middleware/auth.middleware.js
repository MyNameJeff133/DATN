import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getToken = (req) => req.headers.authorization?.split(" ")[1];

const hydrateRequestUser = async (decoded) => {
  const user = await User.findById(decoded.id).select("role isBanned");

  if (!user) {
    return null;
  }

  return {
    id: user._id,
    role: user.role,
    isBanned: user.isBanned,
  };
};

const authMiddleware = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await hydrateRequestUser(decoded);

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export default authMiddleware;

export const optionalAuth = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await hydrateRequestUser(decoded);
    req.user = user && !user.isBanned ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Không đủ quyền" });
  }

  next();
};

export const verifyAdmin = requireRoles("admin");
