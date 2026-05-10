import Comment from "../models/Comment.js";
import ForumPost from "../models/ForumPost.js";
import { notifyUser } from "../utils/notifyUser.js";

const COMMENT_MAX_LENGTH = 500;

export const createComment = async (req, res) => {
  try {
    const { content, postId, parentComment } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Noi dung binh luan khong duoc de trong" });
    }

    if (content.trim().length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({
        message: `Noi dung binh luan toi da ${COMMENT_MAX_LENGTH} ky tu`,
      });
    }

    const post = await ForumPost.findById(postId).populate("author", "name");
    if (!post) {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    if (parentComment) {
      const parent = await Comment.findOne({
        _id: parentComment,
        post: postId,
      });

      if (!parent) {
        return res.status(400).json({ message: "Binh luan cha khong hop le" });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      post: postId,
      parentComment: parentComment || null,
      author: req.user.id,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "author",
      "name email"
    );

    const postAuthorId = post.author?._id || post.author;
    if (postAuthorId && String(postAuthorId) !== String(req.user.id)) {
      const commenterName = populatedComment.author?.name || "Nguoi dung";
      await notifyUser(
        postAuthorId,
        `"${commenterName}" da binh luan bai dang tren dien dan cua ban`,
      );
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Loi tao comment" });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Loi lay danh sach comment" });
  }
};
