import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getMyNotifications,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);

export default router;
