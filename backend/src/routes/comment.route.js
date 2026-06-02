import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js"

const router = express.Router();


router.post("/", auth, createComment);
router.get("/:postId", getCommentsByPost);
router.put("/:id", auth, updateComment);
router.delete("/:id", auth, deleteComment);

export default router;
