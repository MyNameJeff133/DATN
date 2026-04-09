import Comment from "../models/Comment.js";
import ForumPost from "../models/ForumPost.js";

export const createComment = async (req, res) => {
  try {
    const { content, postId, parentComment } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Noi dung binh luan khong duoc de trong" });
    }

    const post = await ForumPost.findById(postId);
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
