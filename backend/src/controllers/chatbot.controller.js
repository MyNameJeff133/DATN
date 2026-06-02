import ChatConversation from "../models/ChatConversation.js";
import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";
import { normalizeChatText } from "../services/chatbot.service.js";

const CHAT_RETENTION_DAYS = 3;
const EMPTY_VALUE = "Đang cập nhật";
const CHAT_SPAM_WINDOW_MS = 15 * 1000;
const CHAT_SPAM_MAX_MESSAGES = 5;
const CHAT_SPAM_BLOCK_MS = 30 * 1000;
const chatSpamBuckets = new Map();

const normalizeText = normalizeChatText;

const getChatSpamKey = (req) =>
  req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || req.socket?.remoteAddress || "unknown"}`;

const cleanupChatSpamBuckets = (now) => {
  for (const [key, bucket] of chatSpamBuckets.entries()) {
    const hasRecentMessages = bucket.timestamps.some(
      (timestamp) => now - timestamp < CHAT_SPAM_WINDOW_MS,
    );

    if (!hasRecentMessages && bucket.blockedUntil <= now) {
      chatSpamBuckets.delete(key);
    }
  }
};

const checkChatSpam = (req) => {
  const now = Date.now();
  cleanupChatSpamBuckets(now);

  const key = getChatSpamKey(req);
  const bucket = chatSpamBuckets.get(key) || { timestamps: [], blockedUntil: 0 };

  if (bucket.blockedUntil > now) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000),
    };
  }

  const timestamps = bucket.timestamps.filter(
    (timestamp) => now - timestamp < CHAT_SPAM_WINDOW_MS,
  );
  timestamps.push(now);

  if (timestamps.length > CHAT_SPAM_MAX_MESSAGES) {
    const blockedUntil = now + CHAT_SPAM_BLOCK_MS;
    chatSpamBuckets.set(key, { timestamps, blockedUntil });

    return {
      limited: true,
      retryAfterSeconds: Math.ceil(CHAT_SPAM_BLOCK_MS / 1000),
    };
  }

  chatSpamBuckets.set(key, { timestamps, blockedUntil: 0 });
  return { limited: false };
};

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
    field: "sideEffects",
    label: "Tác dụng phụ",
    keywords: ["tác dụng phụ", "phản ứng phụ", "tác hại", "tác dụng không mong muốn"],
    format: (drug) =>
      Array.isArray(drug.sideEffects) && drug.sideEffects.length > 0
        ? drug.sideEffects.join(", ")
        : EMPTY_VALUE,
  },
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

const parseSelectionNumber = (message) => {
  const normalizedMessage = normalizeText(message);
  const match = normalizedMessage.match(/^(?:(?:so|chon|muc|lua chon)\s*)?(?:so\s*)?(\d{1,2})$/);

  return match ? Number(match[1]) : null;
};

const getLatestMessageBySender = (messages = [], sender) =>
  [...messages].reverse().find((message) => message?.sender === sender && message?.text);

const parseClarificationMessage = (message) => {
  if (!message?.text) return null;

  const normalizedBotText = normalizeText(message.text);
  let type = null;

  if (normalizedBotText.includes("nhieu thuoc")) {
    type = "drug";
  } else if (normalizedBotText.includes("nhieu benh")) {
    type = "disease";
  }

  if (!type) return null;

  const options = String(message.text)
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(\d{1,2})\.\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((match) => ({
      number: Number(match[1]),
      name: match[2].trim(),
    }));

  return options.length > 0 ? { type, options } : null;
};

const getLatestClarificationContext = (messages = []) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.sender !== "bot") continue;

    const clarification = parseClarificationMessage(message);
    if (!clarification) continue;

    const previousUserMessage = getLatestMessageBySender(
      messages.slice(0, index),
      "user",
    );

    return {
      ...clarification,
      previousUserText: previousUserMessage?.text || "",
    };
  }

  return null;
};

const findByDisplayedName = (items, displayedName) => {
  const normalizedDisplayedName = normalizeText(displayedName);
  return items.find((item) => normalizeText(item.name) === normalizedDisplayedName) || null;
};

const entityStopWords = new Set([
  "anh",
  "ban",
  "benh",
  "bi",
  "can",
  "cho",
  "co",
  "cua",
  "dau",
  "duoc",
  "gi",
  "hoi",
  "la",
  "loai",
  "minh",
  "nay",
  "toi",
  "tra",
  "trieu",
  "thuoc",
  "tim",
  "ve",
  "xin",
]);

const getTokens = (normalizedMessage) =>
  normalizedMessage.split(" ").filter(Boolean);

const medicationRequestKeywords = [
  "thuoc tri",
  "thuoc chua",
  "thuoc dieu tri",
  "thuoc giam",
  "thuoc ha",
  "thuoc nao",
  "dung thuoc",
  "uong thuoc",
  "nen dung thuoc",
  "can thuoc",
  "tim thuoc",
  "loai thuoc",
];

const medicationQueryStopWords = new Set([
  "anh",
  "ban",
  "benh",
  "bi",
  "can",
  "cho",
  "chua",
  "co",
  "cong",
  "cua",
  "de",
  "dieu",
  "dung",
  "duoc",
  "gi",
  "giam",
  "ha",
  "hoi",
  "khong",
  "la",
  "lam",
  "loai",
  "minh",
  "nao",
  "nen",
  "nay",
  "tac",
  "thong",
  "thuoc",
  "tim",
  "tin",
  "toi",
  "tra",
  "tri",
  "trieu",
  "uong",
  "ve",
  "xin",
]);

const isMedicationRequest = (normalizedMessage) => {
  if (!normalizedMessage.includes("thuoc")) return false;

  if (includesAny(normalizedMessage, medicationRequestKeywords)) {
    return true;
  }

  const tokens = getTokens(normalizedMessage);
  return tokens[0] === "thuoc" && tokens.length > 1;
};

const getMedicationQueryTokens = (normalizedMessage) =>
  [...new Set(
    getTokens(normalizedMessage).filter(
      (token) => token.length >= 2 && !medicationQueryStopWords.has(token),
    ),
  )];

const getEntityTokens = (normalizedMessage) =>
  getTokens(normalizedMessage).filter(
    (token) => token.length >= 2 && !entityStopWords.has(token),
  );

const addCandidate = (candidateMap, item, score) => {
  const key = String(item._id);
  const current = candidateMap.get(key);

  if (!current || score > current.score) {
    candidateMap.set(key, { item, score });
  }
};

const getUniqueSortedCandidates = (candidateMap) =>
  [...candidateMap.values()].sort((first, second) => {
    if (second.score !== first.score) return second.score - first.score;
    return first.item.name.localeCompare(second.item.name);
  });

const findDiseaseCandidates = (normalizedMessage, diseases) => {
  const candidateMap = new Map();
  const messageTokens = getTokens(normalizedMessage);
  const entityTokens = getEntityTokens(normalizedMessage);

  diseases.forEach((disease) => {
    const normalizedName = normalizeText(disease.name);

    if (normalizedName === normalizedMessage) {
      addCandidate(candidateMap, disease, 100);
    } else if (normalizedName && normalizedMessage.includes(normalizedName)) {
      addCandidate(candidateMap, disease, 90);
    } else if (
      normalizedName &&
      normalizedMessage.length >= 2 &&
      normalizedName.includes(normalizedMessage)
    ) {
      addCandidate(candidateMap, disease, 75);
    } else if (
      entityTokens.some((token) => token.length >= 3 && normalizedName.includes(token))
    ) {
      addCandidate(candidateMap, disease, 55);
    }

    (disease.symptoms || []).forEach((symptom) => {
      const normalizedSymptom = normalizeText(symptom);
      if (!normalizedSymptom) return;

      if (
        normalizedMessage.includes(normalizedSymptom) ||
        messageTokens.includes(normalizedSymptom)
      ) {
        addCandidate(candidateMap, disease, 70);
        return;
      }

      if (
        normalizedMessage.length >= 2 &&
        normalizedSymptom.includes(normalizedMessage)
      ) {
        addCandidate(candidateMap, disease, 60);
      }
    });
  });

  return getUniqueSortedCandidates(candidateMap);
};

const findDrugCandidates = (normalizedMessage, drugs) => {
  const candidateMap = new Map();
  const entityTokens = getEntityTokens(normalizedMessage);

  drugs.forEach((drug) => {
    const normalizedName = normalizeText(drug.name);
    if (!normalizedName) return;

    if (normalizedName === normalizedMessage) {
      addCandidate(candidateMap, drug, 100);
      return;
    }

    if (normalizedMessage.includes(normalizedName)) {
      addCandidate(candidateMap, drug, 90);
      return;
    }

    if (normalizedName.includes(normalizedMessage)) {
      addCandidate(candidateMap, drug, 80);
      return;
    }

    const matchedTokens = entityTokens.filter(
      (token) => token.length >= 3 && normalizedName.includes(token),
    );

    if (matchedTokens.length > 0) {
      addCandidate(candidateMap, drug, 50 + matchedTokens.length);
    }
  });

  return getUniqueSortedCandidates(candidateMap);
};

const findMedicationDrugCandidates = (normalizedMessage, drugs, diseases) => {
  const queryTokens = getMedicationQueryTokens(normalizedMessage);
  const queryText = queryTokens.join(" ");

  if (queryTokens.length === 0) {
    return [];
  }

  const candidateMap = new Map();

  drugs.forEach((drug) => {
    const normalizedName = normalizeText(drug.name);
    const normalizedUsage = normalizeText(drug.usage);
    const normalizedCategory = normalizeText(drug.category);
    const searchableText = [normalizedName, normalizedUsage, normalizedCategory]
      .filter(Boolean)
      .join(" ");

    let score = 0;

    if (queryText && normalizedUsage.includes(queryText)) {
      score = 95;
    } else if (queryText && normalizedName.includes(queryText)) {
      score = 88;
    } else if (queryText && normalizedCategory.includes(queryText)) {
      score = 82;
    } else if (queryTokens.length > 1 && queryTokens.every((token) => normalizedUsage.includes(token))) {
      score = 80;
    } else {
      const matchedTokens = queryTokens.filter((token) => searchableText.includes(token));

      if (matchedTokens.length > 0) {
        score = 55 + matchedTokens.length * 10;
      }
    }

    if (score > 0) {
      addCandidate(candidateMap, drug, score);
    }
  });

  const diseaseCandidates = findDiseaseCandidates(queryText || normalizedMessage, diseases);

  diseaseCandidates.slice(0, 3).forEach((candidate) => {
    findRelatedDrugsForDisease(candidate.item, drugs).forEach((drug) => {
      addCandidate(candidateMap, drug, Math.max(60, candidate.score - 5));
    });
  });

  return getUniqueSortedCandidates(candidateMap);
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

const buildClarificationReply = (typeLabel, candidates, originalMessage) => {
  const displayedCandidates = candidates.slice(0, 8);
  const candidateList = displayedCandidates
    .map((candidate, index) => `${index + 1}. ${candidate.item.name}`)
    .join("\n");
  const remainingCount = candidates.length - displayedCandidates.length;
  const remainingText =
    remainingCount > 0 ? `\n... và ${remainingCount} kết quả khác.` : "";

  return `Mình tìm thấy nhiều ${typeLabel} phù hợp với "${originalMessage}". Bạn muốn tra cứu thông tin nào?\n\n${candidateList}${remainingText}\n\nBạn có thể nhập số thứ tự (ví dụ: 1) hoặc nhập đúng tên trong danh sách để mình tra cứu chính xác hơn.`;
};

const shouldAskClarification = (candidates) => {
  if (candidates.length <= 1) return false;

  const [bestCandidate, secondCandidate] = candidates;
  return bestCandidate.score < 90 || bestCandidate.score === secondCandidate.score;
};

const buildReplyFromDatabase = async (message, previousMessages = []) => {
  const normalized = normalizeText(message);
  const selectionNumber = parseSelectionNumber(message);
  const clarificationContext =
    selectionNumber !== null ? getLatestClarificationContext(previousMessages) : null;
  const [diseases, drugs] = await Promise.all([
    Disease.find().lean(),
    Drug.find().lean(),
  ]);

  if (selectionNumber !== null) {
    if (!clarificationContext) {
      return "Bạn hãy nhập số sau khi mình gửi danh sách lựa chọn. Bạn cũng có thể nhập tên bệnh, tên thuốc hoặc mô tả triệu chứng cần tra cứu.";
    }

    const selectedOption = clarificationContext.options.find(
      (option) => option.number === selectionNumber,
    );

    if (!selectedOption) {
      return `Mình không thấy lựa chọn số ${selectionNumber} trong danh sách gần nhất. Bạn vui lòng nhập lại số đang có trong danh sách.`;
    }

    const previousNormalizedMessage = normalizeText(clarificationContext.previousUserText);

    if (clarificationContext.type === "disease") {
      const selectedDisease = findByDisplayedName(diseases, selectedOption.name);

      if (!selectedDisease) {
        return "Mình chưa tìm lại được bệnh đã chọn. Bạn vui lòng nhập lại tên bệnh hoặc mô tả triệu chứng.";
      }

      const previousDiseaseIntent = detectIntent(previousNormalizedMessage, diseaseFieldIntents);
      return previousDiseaseIntent
        ? buildFocusedDiseaseReply(selectedDisease, previousDiseaseIntent)
        : buildDiseaseReply(selectedDisease, drugs);
    }

    const selectedDrug = findByDisplayedName(drugs, selectedOption.name);

    if (!selectedDrug) {
      return "Mình chưa tìm lại được thuốc đã chọn. Bạn vui lòng nhập lại tên thuốc.";
    }

    const previousDrugIntent = detectIntent(previousNormalizedMessage, drugFieldIntents);
    return previousDrugIntent
      ? buildFocusedDrugReply(selectedDrug, previousDrugIntent)
      : buildDrugReply(selectedDrug);
  }

  const diseaseIntent = detectIntent(normalized, diseaseFieldIntents);
  const drugIntent = detectIntent(normalized, drugFieldIntents);
  const diseaseCandidates = findDiseaseCandidates(normalized, diseases);
  const drugCandidates = findDrugCandidates(normalized, drugs);
  const diseaseMatch = diseaseCandidates[0]?.item || null;
  const drugMatch = drugCandidates[0]?.item || null;

  // Ưu tiên xử lý câu hỏi dạng "thuốc trị ...", "thuốc nào chữa ..."
  if (isMedicationRequest(normalized)) {
    const medicationCandidates = findMedicationDrugCandidates(normalized, drugs, diseases);

    if (medicationCandidates.length === 0) {
      return "Mình chưa tìm thấy thuốc phù hợp. Bạn có thể mô tả rõ hơn triệu chứng hoặc tên bệnh giúp mình nhé.";
    }

    if (shouldAskClarification(medicationCandidates)) {
      return buildClarificationReply("thuốc", medicationCandidates, message);
    }

    const topDrug = medicationCandidates[0].item;
    return drugIntent ? buildFocusedDrugReply(topDrug, drugIntent) : buildDrugReply(topDrug);
  }

  if (drugIntent && shouldAskClarification(drugCandidates)) {
    return buildClarificationReply("thuốc", drugCandidates, message);
  }

  if (diseaseIntent && shouldAskClarification(diseaseCandidates)) {
    return buildClarificationReply("bệnh", diseaseCandidates, message);
  }

  if (!drugIntent && shouldAskClarification(diseaseCandidates)) {
    return buildClarificationReply("bệnh", diseaseCandidates, message);
  }

  if (!diseaseIntent && shouldAskClarification(drugCandidates)) {
    return buildClarificationReply("thuốc", drugCandidates, message);
  }

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

    const spamStatus = checkChatSpam(req);
    if (spamStatus.limited) {
      res.set("Retry-After", String(spamStatus.retryAfterSeconds));
      return res.status(429).json({
        message: `Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau ${spamStatus.retryAfterSeconds} giây.`,
        retryAfterSeconds: spamStatus.retryAfterSeconds,
      });
    }

    const previousMessages = normalizeMessages(
      Array.isArray(req.body?.messages) ? req.body.messages : [],
    );
    const reply = await buildReplyFromDatabase(message, previousMessages);
    const messages = normalizeMessages([
      ...previousMessages,
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