import express from "express";
import authMiddleware, { requireRoles } from "../middleware/auth.middleware.js";
import {
  createContentFeedback,
  getContentFeedbacks,
  reviewContentFeedback,
} from "../controllers/contentFeedback.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createContentFeedback);
router.get("/", authMiddleware, requireRoles("admin", "moderator"), getContentFeedbacks);
router.patch(
  "/:id/review",
  authMiddleware,
  requireRoles("admin", "moderator"),
  reviewContentFeedback,
);

export default router;
