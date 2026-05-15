import ContentFeedback from "../models/ContentFeedback.js";
import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";
import { notifyUser } from "../utils/notifyUser.js";

const CONTENT_FEEDBACK_MAX_LENGTH = 1000;

const getTargetModel = (targetType) => {
  if (targetType === "disease") {
    return { model: Disease, modelName: "Disease", label: "bệnh" };
  }

  if (targetType === "drug") {
    return { model: Drug, modelName: "Drug", label: "thuốc" };
  }

  return null;
};

export const createContentFeedback = async (req, res) => {
  try {
    const { targetType, targetId, title, content } = req.body;
    const targetConfig = getTargetModel(targetType);

    if (!targetConfig) {
      return res.status(400).json({ message: "Loại nội dung góp ý không hợp lệ" });
    }

    if (!targetId || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tiêu đề và nội dung" });
    }

    if (content.trim().length > CONTENT_FEEDBACK_MAX_LENGTH) {
      return res.status(400).json({
        message: `Nội dung góp ý tối đa ${CONTENT_FEEDBACK_MAX_LENGTH} ký tự`,
      });
    }

    const target = await targetConfig.model.findById(targetId).select("name");
    if (!target) {
      return res.status(404).json({ message: "Không tìm thấy nội dung được góp ý" });
    }

    const feedback = await ContentFeedback.create({
      targetType,
      targetId,
      targetModel: targetConfig.modelName,
      title: title.trim(),
      content: content.trim(),
      submittedBy: req.user.id,
    });

    res.status(201).json({
      message: `Đã gửi góp ý cho ${targetConfig.label} "${target.name}"`,
      feedback,
    });
  } catch (error) {
    console.error("Create content feedback error:", error);
    res.status(500).json({ message: "Không thể gửi góp ý lúc này" });
  }
};

export const getContentFeedbacks = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const query = status === "all" ? {} : { status };

    const feedbacks = await ContentFeedback.find(query)
      .populate("submittedBy", "name email")
      .populate("reviewedBy", "name email role")
      .populate("targetId")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error("Get content feedbacks error:", error);
    res.status(500).json({ message: "Không thể tải danh sách góp ý" });
  }
};

export const reviewContentFeedback = async (req, res) => {
  try {
    const { action } = req.body;
    const feedback = await ContentFeedback.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate("targetId");

    if (!feedback) {
      return res.status(404).json({ message: "Không tìm thấy góp ý" });
    }

    if (!["corrected", "ignored"].includes(action)) {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    feedback.status = action;
    feedback.reviewedBy = req.user.id;
    feedback.reviewedAt = new Date();
    await feedback.save();

    const targetName = feedback.targetId?.name || "nội dung";
    const targetLabel = feedback.targetType === "disease" ? "bệnh" : "thuốc";
    const notificationContent =
      action === "corrected"
        ? `Admin/ kiểm duyệt viên đã xem xét góp ý của bạn. Và đã sửa thông tin ${targetLabel} "${targetName}".`
        : "Admin/ kiểm duyệt viên đã xem xét góp ý của bạn.";

    await notifyUser(feedback.submittedBy?._id || feedback.submittedBy, notificationContent);

    const updatedFeedback = await ContentFeedback.findById(feedback._id)
      .populate("submittedBy", "name email")
      .populate("reviewedBy", "name email role")
      .populate("targetId");

    res.json({
      message: action === "corrected" ? "Đã đánh dấu đã sửa thông tin" : "Đã bỏ qua góp ý",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Review content feedback error:", error);
    res.status(500).json({ message: "Không thể xử lý góp ý" });
  }
};
