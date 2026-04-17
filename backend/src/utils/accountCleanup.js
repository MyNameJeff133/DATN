import ChatConversation from "../models/ChatConversation.js";
import Comment from "../models/Comment.js";
import ForumPost from "../models/ForumPost.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const deleteUserAndRelatedData = async (userId) => {
  const authoredPosts = await ForumPost.find({ author: userId }).select("_id");
  const authoredPostIds = authoredPosts.map((post) => post._id);

  await Comment.deleteMany({
    $or: [
      { author: userId },
      { post: { $in: authoredPostIds } },
    ],
  });

  await ForumPost.deleteMany({ author: userId });

  await ForumPost.updateMany(
    {},
    {
      $pull: {
        likes: userId,
        dislikes: userId,
        helpfulVotes: userId,
        reports: { user: userId },
      },
    },
  );

  await ChatConversation.deleteMany({ user: userId });
  await Notification.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);
};
