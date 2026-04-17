import express from "express";
import {
  clearChatHistory,
  getChatHistory,
  handleChat,
} from "../controllers/chatbot.controller.js";
import authMiddleware, { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", optionalAuth, handleChat);
router.get("/history", authMiddleware, getChatHistory);
router.delete("/history", authMiddleware, clearChatHistory);

export default router;
