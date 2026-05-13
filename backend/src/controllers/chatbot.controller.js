import ChatConversation from "../models/ChatConversation.js";
import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";
import { normalizeChatText } from "../services/chatbot.service.js";
import { rules } from "../utils/chatRules.js";

const CHAT_RETENTION_DAYS = 3;
const EMPTY_VALUE = "Đang cập nhật";

const normalizeText = normalizeChatText;

const includesAny = (normalizedMessage, keywords) =>
  keywords.some((keyword) => normalizedMessage.includes(normalizeText(keyword)));

const diseaseFieldIntents = [
  {
    field: "symptoms",
    label: "Triệu chứng thường gặp",
    keywords: ["triệu chứng", "dấu hiệu", "biểu hiện", "thường gặp", "có triệu chứng gì"],
    format: (disease) =>
      Array.isArray(disease.symptoms) && disease.symptoms.length > 0
        ? disease.symptoms.join(", ")
        : EMPTY_VALUE,
  },
  {
    field: "causes",
    label: "Nguyên nhân",
    keywords: ["nguyên nhân", "vì sao", "tại sao", "do đâu", "lý do", "nguyên do"],
    format: (disease) => disease.causes || EMPTY_VALUE,
  },
  {
    field: "treatment",
    label: "Điều trị tham khảo",
    keywords: ["điều trị", "chữa", "cách chữa", "xử trí", "làm gì", "nên làm gì"],
    format: (disease) => disease.treatment || EMPTY_VALUE,
  },
  {
    field: "prevention",
    label: "Phòng ngừa",
    keywords: ["phòng ngừa", "ngăn ngừa", "dự phòng", "phòng tránh", "tránh bị"],
    format: (disease) => disease.prevention || EMPTY_VALUE,
  },
  {
    field: "description",
    label: "Tổng quan",
    keywords: ["là gì", "mô tả", "tổng quan", "thông tin", "giới thiệu"],
    format: (disease) => disease.description || EMPTY_VALUE,
  },
  {
    field: "severity",
    label: "Mức độ",
    keywords: ["mức độ", "nguy hiểm", "nặng không", "nghiêm trọng", "có nặng"],
    format: (disease) => {
      if (disease.severity === "high") return "Mức độ cao, nên theo dõi sát và đi khám sớm nếu triệu chứng kéo dài hoặc nặng lên.";
      if (disease.severity === "medium") return "Mức độ trung bình, nên theo dõi và cân nhắc đi khám nếu không cải thiện.";
      return "Mức độ thấp, nhưng vẫn cần theo dõi diễn tiến và chăm sóc phù hợp.";
    },
  },
];

const drugFieldIntents = [
  {
    field: "usage",
    label: "Công dụng",
    keywords: ["công dụng", "tác dụng", "dùng để làm gì", "trị gì", "điều trị gì"],
    format: (drug) => drug.usage || EMPTY_VALUE,
  },
  {
    field: "dosage",
    label: "Liều dùng",
    keywords: ["liều dùng", "cách dùng", "uống bao nhiêu", "dùng bao nhiêu", "sử dụng thế nào"],
    format: (drug) => drug.dosage || EMPTY_VALUE,
  },
  {
    field: "sideEffects",
    label: "Tác dụng phụ",
    keywords: ["tác dụng phụ", "phản ứng phụ", "tác hại", "tác dụng không mong muốn"],
    format: (drug) =>
      Array.isArray(drug.sideEffects) && drug.sideEffects.length > 0
        ? drug.sideEffects.join(", ")
        : EMPTY_VALUE,
  },
  {
    field: "contraindications",
    label: "Chống chỉ định",
    keywords: ["chống chỉ định", "không nên dùng", "ai không dùng", "tránh dùng", "không được dùng"],
    format: (drug) =>
      Array.isArray(drug.contraindications) && drug.contraindications.length > 0
        ? drug.contraindications.join(", ")
        : EMPTY_VALUE,
  },
  {
    field: "category",
    label: "Nhóm thuốc",
    keywords: ["nhóm thuốc", "loại thuốc", "danh mục", "phân loại"],
    format: (drug) => drug.category || EMPTY_VALUE,
  },
];

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

const detectIntent = (normalizedMessage, intents) =>
  intents.find((intent) => includesAny(normalizedMessage, intent.keywords)) || null;

const findDiseaseMatch = (normalizedMessage, diseases) => {
  const exactName = diseases.find((disease) => normalizeText(disease.name) === normalizedMessage);
  if (exactName) return exactName;

  const nameInQuestion = diseases.find((disease) => {
    const normalizedName = normalizeText(disease.name);
    return normalizedName && normalizedMessage.includes(normalizedName);
  });
  if (nameInQuestion) return nameInQuestion;

  const symptomMatch = diseases.find((disease) =>
    (disease.symptoms || []).some((symptom) => {
      const normalizedSymptom = normalizeText(symptom);
      return normalizedSymptom && normalizedMessage.includes(normalizedSymptom);
    }),
  );

  return symptomMatch || null;
};

const findDrugMatch = (normalizedMessage, drugs) => {
  const exactName = drugs.find((drug) => normalizeText(drug.name) === normalizedMessage);
  if (exactName) return exactName;

  return (
    drugs.find((drug) => {
      const normalizedName = normalizeText(drug.name);
      return normalizedName && normalizedMessage.includes(normalizedName);
    }) || null
  );
};

const buildFocusedDiseaseReply = (disease, intent) => `${intent.label} của ${disease.name}:

${intent.format(disease)}

Thông tin chỉ mang tính tham khảo. Nếu triệu chứng nặng, kéo dài hoặc bất thường, bạn nên liên hệ cơ sở y tế.`;

const buildFocusedDrugReply = (drug, intent) => `${intent.label} của ${drug.name}:

${intent.format(drug)}

Thông tin chỉ mang tính tham khảo. Vui lòng đọc hướng dẫn sử dụng và hỏi dược sĩ/bác sĩ khi cần.`;

const buildDiseaseReply = (disease, drugs) => {
  const symptomText = Array.isArray(disease.symptoms) ? disease.symptoms.join(", ") : EMPTY_VALUE;
  const relatedDrugs = findRelatedDrugsForDisease(disease, drugs);
  const relatedDrugText =
    relatedDrugs.length > 0
      ? relatedDrugs.map((drug) => drug.name).join(", ")
      : "Chưa tìm thấy thuốc có công dụng liên quan";

  return `Bệnh phù hợp: ${disease.name}

Triệu chứng thường gặp: ${symptomText}
Mô tả: ${disease.description || EMPTY_VALUE}
Nguyên nhân: ${disease.causes || EMPTY_VALUE}
Điều trị tham khảo: ${disease.treatment || EMPTY_VALUE}
Phòng ngừa: ${disease.prevention || EMPTY_VALUE}
Thuốc liên quan: ${relatedDrugText}

Thông tin chỉ mang tính tham khảo.`;
};

const buildDrugReply = (drug) => `Thuốc: ${drug.name}

Công dụng: ${drug.usage || EMPTY_VALUE}
Liều dùng: ${drug.dosage || EMPTY_VALUE}
Tác dụng phụ: ${
  drug.sideEffects?.length ? drug.sideEffects.join(", ") : EMPTY_VALUE
}
Chống chỉ định: ${
  drug.contraindications?.length ? drug.contraindications.join(", ") : EMPTY_VALUE
}

Thông tin chỉ mang tính tham khảo.`;

const buildBestSymptomMatchReply = (bestMatch, highestScore, drugs) => {
  const severityWarning =
    bestMatch.severity === "high"
      ? "\nLưu ý: Đây là dấu hiệu nghiêm trọng, bạn nên đến cơ sở y tế sớm."
      : "";
  const relatedDrugs = findRelatedDrugsForDisease(bestMatch, drugs);
  const drugList =
    relatedDrugs.length > 0
      ? `\nThuốc liên quan: ${relatedDrugs.map((drug) => drug.name).join(", ")}`
      : "";

  return `Có thể bạn đang gặp: ${bestMatch.name}

Triệu chứng trùng: ${highestScore}
Nguyên nhân: ${bestMatch.causes || EMPTY_VALUE}
Điều trị tham khảo: ${bestMatch.treatment || EMPTY_VALUE}
Phòng ngừa: ${bestMatch.prevention || EMPTY_VALUE}${drugList}

Thông tin chỉ mang tính tham khảo.${severityWarning}`;
};

const buildReplyFromDatabase = async (message) => {
  const normalized = normalizeText(message);
  const [diseases, drugs] = await Promise.all([
    Disease.find().lean(),
    Drug.find().lean(),
  ]);

  const diseaseIntent = detectIntent(normalized, diseaseFieldIntents);
  const drugIntent = detectIntent(normalized, drugFieldIntents);
  const diseaseMatch = findDiseaseMatch(normalized, diseases);
  const drugMatch = findDrugMatch(normalized, drugs);

  if (diseaseIntent && diseaseMatch) {
    return buildFocusedDiseaseReply(diseaseMatch, diseaseIntent);
  }

  if (drugIntent && drugMatch) {
    return buildFocusedDrugReply(drugMatch, drugIntent);
  }

  if (diseaseMatch && !drugMatch) {
    return buildDiseaseReply(diseaseMatch, drugs);
  }

  if (drugMatch && !diseaseMatch) {
    return buildDrugReply(drugMatch);
  }

  let bestMatch = null;
  let highestScore = 0;

  for (const disease of diseases) {
    let score = 0;

    for (const symptom of disease.symptoms || []) {
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
    if (diseaseIntent) {
      return buildFocusedDiseaseReply(bestMatch, diseaseIntent);
    }

    return buildBestSymptomMatchReply(bestMatch, highestScore, drugs);
  }

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(normalizeText(keyword))) {
        return rule.reply;
      }
    }
  }

  return "Mình chưa tìm thấy thông tin phù hợp. Bạn có thể mô tả rõ hơn triệu chứng, tên bệnh hoặc tên thuốc giúp mình nhé.";
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
      return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
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
    res.status(500).json({ message: "Lỗi server" });
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
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    await ChatConversation.findOneAndDelete({ user: req.user.id });
    res.json({ message: "Đã xóa lịch sử chat" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
