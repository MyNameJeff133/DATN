import Notification from "../models/Notification.js";

export const notifyUser = async (userId, content) => {
  if (!userId || !content?.trim()) {
    return null;
  }

  return Notification.create({
    user: userId,
    content: content.trim(),
  });
};
