import ChatConversation from "../models/ChatConversation.js";
import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";
import { rules } from "../utils/chatRules.js";

const CHAT_RETENTION_DAYS = 3;

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CHAT_RETENTION_DAYS);
  return expiresAt;
};

const normalizeMessages = (messages = []) =>
  messages
    .filter((message) => message?.sender && message?.text)
    .map((message) => ({
      sender: message.sender,
      text: String(message.text).trim(),
      createdAt: message.createdAt || new Date(),
    }))
    .filter((message) => message.text);

const getDiseaseKeywords = (disease) =>
  [disease.name, ...(Array.isArray(disease.symptoms) ? disease.symptoms : [])]
    .map((item) => normalizeText(item))
    .filter(Boolean);

const findRelatedDrugsForDisease = (disease, drugs) => {
  const diseaseKeywords = getDiseaseKeywords(disease);

  return drugs.filter((drug) => {
    const usage = normalizeText(drug.usage);
    if (!usage) return false;

    return diseaseKeywords.some((keyword) => usage.includes(keyword));
  });
};

const buildDiseaseReply = (disease, drugs) => {
  const symptomText = Array.isArray(disease.symptoms)
    ? disease.symptoms.join(", ")
    : "Đang cập nhật";
  const relatedDrugs = findRelatedDrugsForDisease(disease, drugs);
  const relatedDrugText =
    relatedDrugs.length > 0
      ? relatedDrugs.map((drug) => drug.name).join(", ")
      : "Chưa tìm thấy thuốc có công dụng liên quan";

  return `Bệnh phù hợp: ${disease.name}

Triệu chứng thường gặp: ${symptomText}
Mô tả: ${disease.description || "Đang cập nhật"}
Nguyên nhân: ${disease.causes || "Đang cập nhật"}
Điều trị tham khảo: ${disease.treatment || "Đang cập nhật"}
Phòng ngừa: ${disease.prevention || "Đang cập nhật"}
Thuốc liên quan: ${relatedDrugText}

Thong tin chi mang tinh tham khao.`;
};

const buildDrugReply = (drug) => `Thuốc: ${drug.name}

Công dụng: ${drug.usage || "Đang cập nhật"}
Lượng dùng: ${drug.dosage || "Đang cập nhật"}
Tác dụng phụ: ${
  drug.sideEffects?.length ? drug.sideEffects.join(", ") : "Đang cập nhật"
}
Chống chỉ định: ${
  drug.contraindications?.length
    ? drug.contraindications.join(", ")
    : "Đang cập nhật"
}

Thông tin chỉ mang tính tham khảo.`;

const buildReplyFromDatabase = async (message) => {
  const normalized = normalizeText(message);
  const diseases = await Disease.find();
  const drugs = await Drug.find();

  const exactDiseaseMatch = diseases.find((disease) => {
    const normalizedName = normalizeText(disease.name);
    return normalizedName && normalized.includes(normalizedName);
  });

  if (exactDiseaseMatch) {
    return buildDiseaseReply(exactDiseaseMatch, drugs);
  }

  const exactDrugMatch = drugs.find((drug) => {
    const normalizedName = normalizeText(drug.name);
    return normalizedName && normalized.includes(normalizedName);
  });

  if (exactDrugMatch) {
    return buildDrugReply(exactDrugMatch);
  }

  const directDiseaseMatch = await Disease.findOne({
    $or: [
      { name: { $regex: message, $options: "i" } },
      { symptoms: { $regex: message, $options: "i" } },
      { description: { $regex: message, $options: "i" } },
    ],
  });

  if (directDiseaseMatch) {
    return buildDiseaseReply(directDiseaseMatch, drugs);
  }

  const directDrugMatch = await Drug.findOne({
    $or: [
      { name: { $regex: message, $options: "i" } },
      { usage: { $regex: message, $options: "i" } },
    ],
  });

  if (directDrugMatch) {
    return buildDrugReply(directDrugMatch);
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const disease of diseases) {
    let score = 0;

    for (const symptom of disease.symptoms) {
      if (normalized.includes(normalizeText(symptom))) {
        score++;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = disease;
    }
  }

  if (bestMatch && highestScore >= 2) {
    const severityWarning =
      bestMatch.severity === "high"
        ? "\nLưu ý: Đây là dấu hiệu nghiêm trọng, bạn nên đến cơ sở y tế sớm."
        : "";
    const relatedDrugs = findRelatedDrugsForDisease(bestMatch, drugs);
    const drugList =
      relatedDrugs.length > 0
        ? `\nThuốc liên quan: ${relatedDrugs
            .map((drug) => drug.name)
            .join(", ")}`
        : "";

    return `Co the ban dang gap: ${bestMatch.name}

Trieu chung trung: ${highestScore}
Nguyen nhan: ${bestMatch.causes || "Dang cap nhat"}
Dieu tri tham khao: ${bestMatch.treatment || "Dang cap nhat"}
Phong ngua: ${bestMatch.prevention || "Dang cap nhat"}${drugList}

Thong tin chi mang tinh tham khao.${severityWarning}`;
  }

  for (const drug of drugs) {
    if (normalized.includes(normalizeText(drug.name))) {
      return buildDrugReply(drug);
    }
  }

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(normalizeText(keyword))) {
        return rule.reply;
      }
    }
  }

  return "Minh chua tim thay thong tin phu hop. Ban co the mo ta ro hon trieu chung, ten benh hoac ten thuoc giup minh nhe.";
};

const saveConversationForUser = async (userId, messages) => {
  if (!userId) return null;

  return ChatConversation.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      messages: normalizeMessages(messages),
      expiresAt: getExpiryDate(),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};

export const handleChat = async (req, res) => {
  try {
    const message = req.body?.message?.trim();

    if (!message) {
      return res.status(400).json({ message: "Thieu noi dung tin nhan" });
    }

    const reply = await buildReplyFromDatabase(message);
    const messages = normalizeMessages([
      ...(Array.isArray(req.body?.messages) ? req.body.messages : []),
      { sender: "user", text: message, createdAt: new Date() },
      { sender: "bot", text: reply, createdAt: new Date() },
    ]);

    if (req.user?.id) {
      await saveConversationForUser(req.user.id, messages);
    }

    res.json({
      reply,
      messages,
      persisted: Boolean(req.user?.id),
      expiresInDays: req.user?.id ? CHAT_RETENTION_DAYS : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({
      user: req.user.id,
      expiresAt: { $gt: new Date() },
    }).lean();

    res.json({
      messages: conversation?.messages || [],
      expiresAt: conversation?.expiresAt || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    await ChatConversation.findOneAndDelete({ user: req.user.id });
    res.json({ message: "Da xoa lich su chat" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Loi server" });
  }
};
