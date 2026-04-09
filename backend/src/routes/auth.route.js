import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  register,
  login,
  getProfile,
  changePassword,
  updateProfile,
  getMe,
  adminLogin,
  verifyEmail,
  getAllUsers,
  deleteUser,
  approveUser
} from "../controllers/auth.controller.js";

const router = express.Router(); 

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);

router.get("/verify/:token", verifyEmail);
router.get("/me", authMiddleware, getMe);
router.get("/profile", authMiddleware, getProfile);


// Admin
router.get("/users", authMiddleware, getAllUsers);
router.delete("/users/:id", authMiddleware, deleteUser);

router.put(
  "/users/:id/approve",
  authMiddleware,
  approveUser
);
router.put("/change-password", authMiddleware, changePassword);

router.put("/profile", authMiddleware, updateProfile);
export default router;