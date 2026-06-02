import Comment from "../models/Comment.js";
import ForumPost from "../models/ForumPost.js";
import { notifyUser } from "../utils/notifyUser.js";

const COMMENT_MAX_LENGTH = 500;

const isSameId = (left, right) => String(left || "") === String(right || "");

const collectCommentAndReplyIds = (comments, rootCommentId) => {
  const idsToDelete = new Set([String(rootCommentId)]);
  let foundMore = true;

  while (foundMore) {
    foundMore = false;

    comments.forEach((comment) => {
      const commentId = String(comment._id);
      const parentId = comment.parentComment ? String(comment.parentComment) : "";

      if (idsToDelete.has(parentId) && !idsToDelete.has(commentId)) {
        idsToDelete.add(commentId);
        foundMore = true;
      }
    });
  }

  return Array.from(idsToDelete);
};

export const createComment = async (req, res) => {
  try {
    const { content, postId, parentComment } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    if (content.trim().length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({
        message: `Nội dung bình luận tối đa ${COMMENT_MAX_LENGTH} ký tự`,
      });
    }

    const post = await ForumPost.findById(postId).populate("author", "name");
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    if (parentComment) {
      const parent = await Comment.findOne({
        _id: parentComment,
        post: postId,
      });

      if (!parent) {
        return res.status(400).json({ message: "Bình luận cha không hợp lệ" });
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
      const commenterName = populatedComment.author?.name || "Người dùng";
      await notifyUser(
        postAuthorId,
        `"${commenterName}" đã bình luận bài đăng trên diễn đàn của bạn`,
      );
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Lỗi tạo bình luận" });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách bình luận" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    if (content.trim().length > COMMENT_MAX_LENGTH) {
      return res.status(400).json({
        message: `Nội dung bình luận tối đa ${COMMENT_MAX_LENGTH} ký tự`,
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    if (!isSameId(comment.author, req.user.id)) {
      return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này" });
    }

    comment.content = content.trim();
    await comment.save();
    await comment.populate("author", "name email");

    res.json(comment);
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Không thể cập nhật bình luận" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    if (!isSameId(comment.author, req.user.id)) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });
    }

    const commentsInPost = await Comment.find({ post: comment.post }).select("_id parentComment");
    const deletedCommentIds = collectCommentAndReplyIds(commentsInPost, comment._id);

    await Comment.deleteMany({ _id: { $in: deletedCommentIds } });

    res.json({
      message: "Đã xóa bình luận",
      deletedCommentIds,
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Không thể xóa bình luận" });
  }
};
