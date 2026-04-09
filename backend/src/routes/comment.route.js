import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createComment,
  getCommentsByPost
} from "../controllers/comment.controller.js"

const router = express.Router();


router.post("/", auth, createComment);
router.get("/:postId", getCommentsByPost);

export default router;