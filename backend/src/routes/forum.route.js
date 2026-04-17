import express from "express";
import auth from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/auth.middleware.js";
import {
  createPost,
  getPosts,
  getPostById,
  likePost,
  dislikePost,
  reportPost,
  getReportedPosts,
  moderatePost
} from "../controllers/forum.controller.js";

const router = express.Router();

router.get("/admin/reports", auth, requireRoles("admin", "moderator"), getReportedPosts);
router.patch("/admin/:id/moderate", auth, requireRoles("admin", "moderator"), moderatePost);

router.post("/", auth, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);

router.post("/:id/like", auth, likePost);
router.post("/:id/dislike", auth, dislikePost);
router.post("/:id/report", auth, reportPost);

export default router;
