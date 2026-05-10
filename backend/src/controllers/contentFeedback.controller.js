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
      return res.status(400).json({ message: "Loai noi dung gop y khong hop le" });
    }

    if (!targetId || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Vui long nhap day du tieu de va noi dung" });
    }

    if (content.trim().length > CONTENT_FEEDBACK_MAX_LENGTH) {
      return res.status(400).json({
        message: `Noi dung gop y toi da ${CONTENT_FEEDBACK_MAX_LENGTH} ky tu`,
      });
    }

    const target = await targetConfig.model.findById(targetId).select("name");
    if (!target) {
      return res.status(404).json({ message: "Khong tim thay noi dung duoc gop y" });
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
      message: `Da gui gop y cho ${targetConfig.label} "${target.name}"`,
      feedback,
    });
  } catch (error) {
    console.error("Create content feedback error:", error);
    res.status(500).json({ message: "Khong the gui gop y luc nay" });
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
    res.status(500).json({ message: "Khong the tai danh sach gop y" });
  }
};

export const reviewContentFeedback = async (req, res) => {
  try {
    const { action } = req.body;
    const feedback = await ContentFeedback.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate("targetId");

    if (!feedback) {
      return res.status(404).json({ message: "Khong tim thay gop y" });
    }

    if (!["corrected", "ignored"].includes(action)) {
      return res.status(400).json({ message: "Hanh dong khong hop le" });
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
      message: action === "corrected" ? "Da danh dau da sua thong tin" : "Da bo qua gop y",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Review content feedback error:", error);
    res.status(500).json({ message: "Khong the xu ly gop y" });
  }
};
