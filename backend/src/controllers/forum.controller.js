import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";

const attachCommentCounts = async (posts) => {
  const validPosts = posts.filter(Boolean);
  const postIds = validPosts.map((post) => post._id);

  if (postIds.length === 0) {
    return [];
  }

  const counts = await Comment.aggregate([
    {
      $match: {
        post: { $in: postIds },
      },
    },
    {
      $group: {
        _id: "$post",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    counts.map((item) => [String(item._id), item.count])
  );

  return validPosts.map((post) => {
    const postObject =
      typeof post.toObject === "function" ? post.toObject() : post;

    return {
      ...postObject,
      commentCount: countMap.get(String(post._id)) || 0,
      reportCount: postObject.reports?.length || 0,
    };
  });
};

const enrichSinglePost = async (post) => {
  const [postWithMeta] = await attachCommentCounts([post]);
  return postWithMeta;
};

export const createPost = async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Vui long nhap tieu de va noi dung" });
    }

    const post = await ForumPost.create({
      title: title.trim(),
      content: content.trim(),
      tags,
      author: req.user.id,
    });

    const populatedPost = await ForumPost.findById(post._id).populate("author", "name");
    const postWithCount = await enrichSinglePost(populatedPost);

    res.status(201).json(postWithCount);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Loi tao bai viet" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({
      status: { $ne: "hidden" },
    })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    const postsWithCounts = await attachCommentCounts(posts);

    res.json(postsWithCounts);
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate("author", "name");

    if (!post || post.status === "hidden") {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    post.views += 1;
    await post.save();

    const postWithCount = await enrichSinglePost(post);

    res.json(postWithCount);
  } catch (error) {
    console.error("Get post by id error:", error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    const userId = req.user.id;

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      post.dislikes.pull(userId);
    }

    await post.save();
    const postWithCount = await enrichSinglePost(post);
    res.json(postWithCount);
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Loi xu ly thao tac" });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    const userId = req.user.id;

    if (post.dislikes.includes(userId)) {
      post.dislikes.pull(userId);
    } else {
      post.dislikes.push(userId);
      post.likes.pull(userId);
    }

    await post.save();
    const postWithCount = await enrichSinglePost(post);
    res.json(postWithCount);
  } catch (error) {
    console.error("Dislike post error:", error);
    res.status(500).json({ message: "Loi xu ly thao tac" });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post || post.status === "hidden") {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    if (!reason?.trim()) {
      return res.status(400).json({ message: "Vui long nhap ly do bao cao" });
    }

    const alreadyReported = post.reports.some(
      (report) => String(report.user) === String(req.user.id)
    );

    if (alreadyReported) {
      return res.status(400).json({ message: "Ban da bao cao bai viet nay roi" });
    }

    post.reports.push({
      user: req.user.id,
      reason: reason.trim(),
    });
    post.status = "reported";

    await post.save();

    const postWithCount = await enrichSinglePost(post);

    res.json({
      message: "Bao cao bai viet thanh cong",
      post: postWithCount,
    });
  } catch (error) {
    console.error("Report post error:", error);
    res.status(500).json({ message: "Khong the bao cao bai viet luc nay" });
  }
};

export const getReportedPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({
      $or: [{ status: "reported" }, { "reports.0": { $exists: true } }],
    })
      .populate("author", "name email")
      .populate("reports.user", "name email")
      .sort({ updatedAt: -1 });

    const postsWithCounts = await attachCommentCounts(posts);

    res.json(postsWithCounts);
  } catch (error) {
    console.error("Get reported posts error:", error);
    res.status(500).json({ message: "Loi tai danh sach bao cao" });
  }
};

export const moderatePost = async (req, res) => {
  try {
    const { action } = req.body;
    const post = await ForumPost.findById(req.params.id)
      .populate("author", "name email")
      .populate("reports.user", "name email");

    if (!post) {
      return res.status(404).json({ message: "Khong tim thay bai viet" });
    }

    if (action === "hide") {
      post.status = "hidden";
    } else if (action === "restore") {
      post.status = "active";
      post.reports = [];
    } else if (action === "dismiss") {
      post.status = "resolved";
      post.reports = [];
    } else {
      return res.status(400).json({ message: "Hanh dong khong hop le" });
    }

    await post.save();

    const postWithCount = await enrichSinglePost(post);
    res.json({
      message: "Cap nhat bai viet thanh cong",
      post: postWithCount,
    });
  } catch (error) {
    console.error("Moderate post error:", error);
    res.status(500).json({ message: "Khong the cap nhat bai viet" });
  }
};
