import ChatConversation from "../models/ChatConversation.js";
import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";
import { normalizeChatText } from "../services/chatbot.service.js";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const CHAT_RETENTION_DAYS = 3;
const EMPTY_VALUE = "Đang cập nhật";
const CHAT_SPAM_WINDOW_MS = 15 * 1000;
const CHAT_SPAM_MAX_MESSAGES = 5;
const CHAT_SPAM_BLOCK_MS = 30 * 1000;
const chatSpamBuckets = new Map();

const normalizeText = normalizeChatText;

// ─────────────────────────────────────────────
// Spam protection
// ─────────────────────────────────────────────
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
    return { limited: true, retryAfterSeconds: Math.ceil((bucket.blockedUntil - now) / 1000) };
  }

  const timestamps = bucket.timestamps.filter((t) => now - t < CHAT_SPAM_WINDOW_MS);
  timestamps.push(now);

  if (timestamps.length > CHAT_SPAM_MAX_MESSAGES) {
    const blockedUntil = now + CHAT_SPAM_BLOCK_MS;
    chatSpamBuckets.set(key, { timestamps, blockedUntil });
    return { limited: true, retryAfterSeconds: Math.ceil(CHAT_SPAM_BLOCK_MS / 1000) };
  }

  chatSpamBuckets.set(key, { timestamps, blockedUntil: 0 });
  return { limited: false };
};

// ─────────────────────────────────────────────
// Intent definitions
// ─────────────────────────────────────────────
const includesAny = (normalizedMessage, keywords) =>
  keywords.some((kw) => normalizedMessage.includes(normalizeText(kw)));

const diseaseFieldIntents = [
  {
    field: "symptoms",
    label: "Triệu chứng thường gặp",
    keywords: ["triệu chứng", "dấu hiệu", "biểu hiện", "thường gặp", "có triệu chứng gì"],
    format: (d) =>
      Array.isArray(d.symptoms) && d.symptoms.length > 0 ? d.symptoms.join(", ") : EMPTY_VALUE,
  },
  {
    field: "causes",
    label: "Nguyên nhân",
    keywords: ["nguyên nhân", "vì sao", "tại sao", "do đâu", "lý do", "nguyên do"],
    format: (d) => d.causes || EMPTY_VALUE,
  },
  {
    field: "treatment",
    label: "Điều trị tham khảo",
    keywords: ["điều trị", "chữa", "cách chữa", "xử trí", "làm gì", "nên làm gì"],
    format: (d) => d.treatment || EMPTY_VALUE,
  },
  {
    field: "prevention",
    label: "Phòng ngừa",
    keywords: ["phòng ngừa", "ngăn ngừa", "dự phòng", "phòng tránh", "tránh bị"],
    format: (d) => d.prevention || EMPTY_VALUE,
  },
  {
    field: "description",
    label: "Tổng quan",
    keywords: ["là gì", "mô tả", "tổng quan", "thông tin", "giới thiệu"],
    format: (d) => d.description || EMPTY_VALUE,
  },
  {
    field: "severity",
    label: "Mức độ",
    keywords: ["mức độ", "nguy hiểm", "nặng không", "nghiêm trọng", "có nặng"],
    format: (d) => {
      if (d.severity === "high") return "Mức độ cao, nên theo dõi sát và đi khám sớm nếu triệu chứng kéo dài hoặc nặng lên.";
      if (d.severity === "medium") return "Mức độ trung bình, nên theo dõi và cân nhắc đi khám nếu không cải thiện.";
      return "Mức độ thấp, nhưng vẫn cần theo dõi diễn tiến và chăm sóc phù hợp.";
    },
  },
];

// sideEffects phải đứng TRƯỚC usage để "tác dụng phụ" không bị match nhầm vào "tác dụng"
const drugFieldIntents = [
  {
    field: "sideEffects",
    label: "Tác dụng phụ",
    keywords: ["tác dụng phụ", "phản ứng phụ", "tác hại", "tác dụng không mong muốn"],
    format: (d) =>
      Array.isArray(d.sideEffects) && d.sideEffects.length > 0
        ? d.sideEffects.join(", ")
        : EMPTY_VALUE,
  },
  {
    field: "usage",
    label: "Công dụng",
    keywords: ["công dụng", "tác dụng", "dùng để làm gì", "trị gì", "điều trị gì"],
    format: (d) => d.usage || EMPTY_VALUE,
  },
  {
    field: "dosage",
    label: "Liều dùng",
    keywords: ["liều dùng", "cách dùng", "uống bao nhiêu", "dùng bao nhiêu", "sử dụng thế nào"],
    format: (d) => d.dosage || EMPTY_VALUE,
  },
  {
    field: "contraindications",
    label: "Chống chỉ định",
    keywords: ["chống chỉ định", "không nên dùng", "ai không dùng", "tránh dùng", "không được dùng"],
    format: (d) =>
      Array.isArray(d.contraindications) && d.contraindications.length > 0
        ? d.contraindications.join(", ")
        : EMPTY_VALUE,
  },
  {
    field: "category",
    label: "Nhóm thuốc",
    keywords: ["nhóm thuốc", "loại thuốc", "danh mục", "phân loại"],
    format: (d) => d.category || EMPTY_VALUE,
  },
];

const detectIntent = (normalizedMessage, intents) =>
  intents.find((intent) => includesAny(normalizedMessage, intent.keywords)) || null;

// ─────────────────────────────────────────────
// Stop words & tokenizer
// ─────────────────────────────────────────────
const entityStopWords = new Set([
  "anh", "ban", "benh", "bi", "can", "cho", "co", "cua", "dau", "duoc",
  "gi", "hoi", "la", "loai", "minh", "nay", "toi", "tra", "trieu",
  "thuoc", "tim", "ve", "xin",
]);

const medicationQueryStopWords = new Set([
  "anh", "ban", "benh", "bi", "can", "cho", "chua", "co", "cong", "cua",
  "de", "dieu", "dung", "duoc", "gi", "giam", "ha", "hoi", "khong", "la",
  "lam", "loai", "minh", "nao", "nen", "nay", "tac", "thong", "thuoc",
  "tim", "tin", "toi", "tra", "tri", "trieu", "uong", "ve", "xin",
]);

const getTokens = (normalizedMessage) => normalizedMessage.split(" ").filter(Boolean);

const getEntityTokens = (normalizedMessage) =>
  getTokens(normalizedMessage).filter((t) => t.length >= 2 && !entityStopWords.has(t));

const getMedicationQueryTokens = (normalizedMessage) =>
  [...new Set(
    getTokens(normalizedMessage).filter(
      (t) => t.length >= 2 && !medicationQueryStopWords.has(t),
    ),
  )];

// ─────────────────────────────────────────────
// Medication request detection
// ─────────────────────────────────────────────
const medicationRequestKeywords = [
  "thuoc tri", "thuoc chua", "thuoc dieu tri", "thuoc giam", "thuoc ha",
  "thuoc nao", "dung thuoc", "uong thuoc", "nen dung thuoc", "can thuoc",
  "tim thuoc", "loai thuoc",
];

const isMedicationRequest = (normalizedMessage) => {
  if (!normalizedMessage.includes("thuoc")) return false;
  if (includesAny(normalizedMessage, medicationRequestKeywords)) return true;
  const tokens = getTokens(normalizedMessage);
  return tokens[0] === "thuoc" && tokens.length > 1;
};

// ─────────────────────────────────────────────
// [NEW] So sánh thuốc detection
// ─────────────────────────────────────────────
const compareKeywords = [
  "so sanh", "khac nhau", "giong nhau", "khac gi", "uu diem", "nhuoc diem",
  "nen chon", "tot hon", "hay hon", "chon loai nao", "dung loai nao",
];

const isCompareRequest = (normalizedMessage) =>
  compareKeywords.some((kw) => normalizedMessage.includes(kw));

// ─────────────────────────────────────────────
// [NEW] Tìm thuốc thay thế detection
// ─────────────────────────────────────────────
const substituteKeywords = [
  "thuoc thay the", "thay the", "thuoc tuong duong", "tuong duong",
  "co thuoc nao khac", "thuoc khac thay", "doi thuoc", "thay bang thuoc",
  "thuoc co tac dung tuong tu", "tac dung tuong tu",
];

const isSubstituteRequest = (normalizedMessage) =>
  substituteKeywords.some((kw) => normalizedMessage.includes(kw));

// ─────────────────────────────────────────────
// [NEW] Context parsing — lấy entity được nhắc gần nhất trong lịch sử
// ─────────────────────────────────────────────
const CONTEXT_WINDOW = 6; // số tin nhắn gần nhất cần xét

/**
 * Trích tên entity (drug/disease) được nhắc trong một tin nhắn bot.
 * Nhận dạng qua các tiền tố chuẩn trong buildDrugReply / buildDiseaseReply.
 */
const extractEntityFromBotMessage = (text) => {
  if (!text) return null;
  // "Thuốc: <tên>" hoặc "Bệnh phù hợp: <tên>" hoặc "Có thể bạn đang gặp: <tên>"
  const patterns = [
    /^Thuốc:\s*(.+)/m,
    /^Bệnh phù hợp:\s*(.+)/m,
    /^Có thể bạn đang gặp:\s*(.+)/m,
    /^Tổng quan của\s*(.+?):/m,
    /^Công dụng của\s*(.+?):/m,
    /^Tác dụng phụ của\s*(.+?):/m,
    /^Liều dùng của\s*(.+?):/m,
    /^Chống chỉ định của\s*(.+?):/m,
    /^Nhóm thuốc của\s*(.+?):/m,
    /^Triệu chứng thường gặp của\s*(.+?):/m,
    /^Nguyên nhân của\s*(.+?):/m,
    /^Điều trị tham khảo của\s*(.+?):/m,
    /^Phòng ngừa của\s*(.+?):/m,
    /^Mức độ của\s*(.+?):/m,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

/**
 * Lấy context entity gần nhất (drug/disease name) từ lịch sử hội thoại.
 * Trả về { entityName, entityType } hoặc null.
 */
const getConversationContext = (previousMessages, drugs, diseases) => {
  const recentMessages = previousMessages.slice(-CONTEXT_WINDOW);

  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i];
    if (msg?.sender !== "bot") continue;

    const entityName = extractEntityFromBotMessage(msg.text);
    if (!entityName) continue;

    const normalizedName = normalizeText(entityName);
    const matchedDrug = drugs.find((d) => normalizeText(d.name) === normalizedName);
    if (matchedDrug) return { entity: matchedDrug, entityType: "drug" };

    const matchedDisease = diseases.find((d) => normalizeText(d.name) === normalizedName);
    if (matchedDisease) return { entity: matchedDisease, entityType: "disease" };
  }

  return null;
};

/**
 * Khi tin nhắn không có tên entity cụ thể nhưng có intent (vd: "tác dụng phụ là gì?"),
 * áp dụng context entity gần nhất.
 */
const isFollowUpMessage = (normalizedMessage, drugs, diseases) => {
  // Nếu message quá ngắn hoặc không chứa tên thuốc/bệnh nào → có khả năng là follow-up
  const hasEntityToken = [...drugs, ...diseases].some((item) => {
    const normalizedName = normalizeText(item.name);
    return normalizedName && normalizedMessage.includes(normalizedName);
  });
  return !hasEntityToken;
};

// ─────────────────────────────────────────────
// [NEW] Alias matching — tìm drug bằng tên đồng nghĩa
// ─────────────────────────────────────────────
/**
 * Drug schema nên có field `aliases: [String]`.
 * Hàm này match cả name lẫn aliases.
 */
const findDrugByNameOrAlias = (drugs, normalizedQuery) => {
  // Exact match tên chính
  let found = drugs.find((d) => normalizeText(d.name) === normalizedQuery);
  if (found) return found;

  // Exact match alias
  found = drugs.find((d) =>
    Array.isArray(d.aliases) &&
    d.aliases.some((alias) => normalizeText(alias) === normalizedQuery),
  );
  if (found) return found;

  // Partial match tên chính
  found = drugs.find((d) => {
    const n = normalizeText(d.name);
    return n && (n.includes(normalizedQuery) || normalizedQuery.includes(n));
  });
  if (found) return found;

  // Partial match alias
  found = drugs.find((d) =>
    Array.isArray(d.aliases) &&
    d.aliases.some((alias) => {
      const n = normalizeText(alias);
      return n && (n.includes(normalizedQuery) || normalizedQuery.includes(n));
    }),
  );
  return found || null;
};

// ─────────────────────────────────────────────
// Candidate finders
// ─────────────────────────────────────────────
const addCandidate = (candidateMap, item, score) => {
  const key = String(item._id);
  const current = candidateMap.get(key);
  if (!current || score > current.score) {
    candidateMap.set(key, { item, score });
  }
};

const getUniqueSortedCandidates = (candidateMap) =>
  [...candidateMap.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
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
    } else if (normalizedName && normalizedMessage.length >= 2 && normalizedName.includes(normalizedMessage)) {
      addCandidate(candidateMap, disease, 75);
    } else if (entityTokens.some((t) => t.length >= 3 && normalizedName.includes(t))) {
      addCandidate(candidateMap, disease, 55);
    }

    (disease.symptoms || []).forEach((symptom) => {
      const ns = normalizeText(symptom);
      if (!ns) return;
      if (normalizedMessage.includes(ns) || messageTokens.includes(ns)) {
        addCandidate(candidateMap, disease, 70);
      } else if (normalizedMessage.length >= 2 && ns.includes(normalizedMessage)) {
        addCandidate(candidateMap, disease, 60);
      }
    });
  });

  return getUniqueSortedCandidates(candidateMap);
};

/**
 * [UPDATED] findDrugCandidates — xét thêm aliases
 */
const findDrugCandidates = (normalizedMessage, drugs) => {
  const candidateMap = new Map();
  const entityTokens = getEntityTokens(normalizedMessage);

  drugs.forEach((drug) => {
    const normalizedName = normalizeText(drug.name);
    if (!normalizedName) return;

    // Match tên chính
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

    // [NEW] Match aliases
    if (Array.isArray(drug.aliases)) {
      for (const alias of drug.aliases) {
        const na = normalizeText(alias);
        if (!na) continue;
        if (na === normalizedMessage) { addCandidate(candidateMap, drug, 98); return; }
        if (normalizedMessage.includes(na)) { addCandidate(candidateMap, drug, 88); return; }
        if (na.includes(normalizedMessage)) { addCandidate(candidateMap, drug, 78); return; }
      }
    }

    const matchedTokens = entityTokens.filter((t) => t.length >= 3 && normalizedName.includes(t));
    if (matchedTokens.length > 0) {
      addCandidate(candidateMap, drug, 50 + matchedTokens.length);
    }
  });

  return getUniqueSortedCandidates(candidateMap);
};

const findMedicationDrugCandidates = (normalizedMessage, drugs, diseases) => {
  const queryTokens = getMedicationQueryTokens(normalizedMessage);
  const queryText = queryTokens.join(" ");

  if (queryTokens.length === 0) return [];

  const candidateMap = new Map();

  drugs.forEach((drug) => {
    const normalizedName = normalizeText(drug.name);
    const normalizedUsage = normalizeText(drug.usage);
    const normalizedCategory = normalizeText(drug.category);
    const aliasText = Array.isArray(drug.aliases)
      ? drug.aliases.map((a) => normalizeText(a)).join(" ")
      : "";
    const searchableText = [normalizedName, normalizedUsage, normalizedCategory, aliasText]
      .filter(Boolean)
      .join(" ");

    let score = 0;
    if (queryText && normalizedUsage.includes(queryText)) score = 95;
    else if (queryText && normalizedName.includes(queryText)) score = 88;
    else if (queryText && normalizedCategory.includes(queryText)) score = 82;
    else if (queryText && aliasText.includes(queryText)) score = 85;
    else if (queryTokens.length > 1 && queryTokens.every((t) => normalizedUsage.includes(t))) score = 80;
    else {
      const matchedTokens = queryTokens.filter((t) => searchableText.includes(t));
      if (matchedTokens.length > 0) score = 55 + matchedTokens.length * 10;
    }

    if (score > 0) addCandidate(candidateMap, drug, score);
  });

  const diseaseCandidates = findDiseaseCandidates(queryText || normalizedMessage, diseases);
  diseaseCandidates.slice(0, 3).forEach((c) => {
    findRelatedDrugsForDisease(c.item, drugs).forEach((drug) => {
      addCandidate(candidateMap, drug, Math.max(60, c.score - 5));
    });
  });

  return getUniqueSortedCandidates(candidateMap);
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getDiseaseKeywords = (disease) =>
  [disease.name, ...(Array.isArray(disease.symptoms) ? disease.symptoms : [])]
    .map((item) => normalizeText(item))
    .filter(Boolean);

const findRelatedDrugsForDisease = (disease, drugs) => {
  const keywords = getDiseaseKeywords(disease);
  return drugs.filter((drug) => {
    const usage = normalizeText(drug.usage);
    return usage && keywords.some((kw) => usage.includes(kw));
  });
};

const getExpiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + CHAT_RETENTION_DAYS);
  return d;
};

const normalizeMessages = (messages = []) =>
  messages
    .filter((m) => m?.sender && m?.text)
    .map((m) => ({
      sender: m.sender,
      text: String(m.text).trim(),
      createdAt: m.createdAt || new Date(),
    }))
    .filter((m) => m.text);

const findByDisplayedName = (items, displayedName) => {
  const norm = normalizeText(displayedName);
  return items.find((item) => normalizeText(item.name) === norm) || null;
};

// ─────────────────────────────────────────────
// Clarification context (chọn số từ danh sách)
// ─────────────────────────────────────────────
const parseSelectionNumber = (message) => {
  const norm = normalizeText(message);
  const match = norm.match(/^(?:(?:so|chon|muc|lua chon)\s*)?(?:so\s*)?(\d{1,2})$/);
  return match ? Number(match[1]) : null;
};

const getLatestMessageBySender = (messages = [], sender) =>
  [...messages].reverse().find((m) => m?.sender === sender && m?.text);

const parseClarificationMessage = (message) => {
  if (!message?.text) return null;
  const norm = normalizeText(message.text);
  let type = null;

  if (norm.includes("nhieu thuoc")) type = "drug";
  else if (norm.includes("nhieu benh")) type = "disease";

  if (!type) return null;

  const options = String(message.text)
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(\d{1,2})\.\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((match) => ({ number: Number(match[1]), name: match[2].trim() }));

  return options.length > 0 ? { type, options } : null;
};

const getLatestClarificationContext = (messages = []) => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.sender !== "bot") continue;
    const clarification = parseClarificationMessage(msg);
    if (!clarification) continue;
    const previousUserMessage = getLatestMessageBySender(messages.slice(0, i), "user");
    return { ...clarification, previousUserText: previousUserMessage?.text || "" };
  }
  return null;
};

// ─────────────────────────────────────────────
// Reply builders
// ─────────────────────────────────────────────
const buildFocusedDiseaseReply = (disease, intent) =>
  `${intent.label} của ${disease.name}:\n\n${intent.format(disease)}\n\nThông tin chỉ mang tính tham khảo. Nếu triệu chứng nặng, kéo dài hoặc bất thường, bạn nên liên hệ cơ sở y tế.`;

const buildFocusedDrugReply = (drug, intent) =>
  `${intent.label} của ${drug.name}:\n\n${intent.format(drug)}\n\nThông tin chỉ mang tính tham khảo. Vui lòng đọc hướng dẫn sử dụng và hỏi dược sĩ/bác sĩ khi cần.`;

const buildDiseaseReply = (disease, drugs) => {
  const symptomText = Array.isArray(disease.symptoms) ? disease.symptoms.join(", ") : EMPTY_VALUE;
  const relatedDrugs = findRelatedDrugsForDisease(disease, drugs);
  const relatedDrugText =
    relatedDrugs.length > 0
      ? relatedDrugs.map((d) => d.name).join(", ")
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

const buildDrugReply = (drug) => {
  const aliasText =
    Array.isArray(drug.aliases) && drug.aliases.length > 0
      ? `\nTên khác: ${drug.aliases.join(", ")}`
      : "";
  return `Thuốc: ${drug.name}${aliasText}

Công dụng: ${drug.usage || EMPTY_VALUE}
Liều dùng: ${drug.dosage || EMPTY_VALUE}
Tác dụng phụ: ${drug.sideEffects?.length ? drug.sideEffects.join(", ") : EMPTY_VALUE}
Chống chỉ định: ${drug.contraindications?.length ? drug.contraindications.join(", ") : EMPTY_VALUE}

Thông tin chỉ mang tính tham khảo.`;
};

// [NEW] Hiển thị nhiều bệnh có khả năng mắc (top 3 với score)
const buildMultipleDiseaseReply = (scoredDiseases, drugs) => {
  if (scoredDiseases.length === 0) return null;

  // Nếu chỉ 1 bệnh hoặc bệnh đầu score cao vượt trội → trả về kết quả đơn
  const [best, second] = scoredDiseases;
  if (!second || (best.score >= 2 && best.score > second.score * 1.5)) {
    return buildBestSymptomMatchReply(best.disease, best.score, drugs);
  }

  const topDiseases = scoredDiseases.slice(0, 3);
  const lines = topDiseases.map((entry, i) => {
    const relatedDrugs = findRelatedDrugsForDisease(entry.disease, drugs);
    const drugHint =
      relatedDrugs.length > 0
        ? `  Thuốc thường dùng: ${relatedDrugs.slice(0, 3).map((d) => d.name).join(", ")}`
        : "";
    const severityLabel =
      entry.disease.severity === "high" ? " ⚠️ Nghiêm trọng" :
      entry.disease.severity === "medium" ? " ⚡ Trung bình" : "";
    return `${i + 1}. ${entry.disease.name}${severityLabel} (triệu chứng trùng: ${entry.score})\n   ${entry.disease.description || ""}${drugHint ? "\n" + drugHint : ""}`;
  });

  return `Dựa trên các triệu chứng bạn mô tả, mình tìm thấy ${topDiseases.length} khả năng:

${lines.join("\n\n")}

Bạn có thể nhập tên bệnh cụ thể để xem thêm chi tiết.
⚠️ Thông tin chỉ mang tính tham khảo. Vui lòng đến cơ sở y tế để được chẩn đoán chính xác.`;
};

const buildBestSymptomMatchReply = (bestMatch, highestScore, drugs) => {
  const severityWarning =
    bestMatch.severity === "high"
      ? "\nLưu ý: Đây là dấu hiệu nghiêm trọng, bạn nên đến cơ sở y tế sớm."
      : "";
  const relatedDrugs = findRelatedDrugsForDisease(bestMatch, drugs);
  const drugList =
    relatedDrugs.length > 0
      ? `\nThuốc liên quan: ${relatedDrugs.map((d) => d.name).join(", ")}`
      : "";

  return `Có thể bạn đang gặp: ${bestMatch.name}

Triệu chứng trùng: ${highestScore}
Nguyên nhân: ${bestMatch.causes || EMPTY_VALUE}
Điều trị tham khảo: ${bestMatch.treatment || EMPTY_VALUE}
Phòng ngừa: ${bestMatch.prevention || EMPTY_VALUE}${drugList}

Thông tin chỉ mang tính tham khảo.${severityWarning}`;
};

// [NEW] So sánh 2 thuốc
const buildDrugComparisonReply = (drug1, drug2) => {
  const formatField = (val, isArray = false) => {
    if (isArray) return Array.isArray(val) && val.length > 0 ? val.join(", ") : EMPTY_VALUE;
    return val || EMPTY_VALUE;
  };

  const alias1 =
    Array.isArray(drug1.aliases) && drug1.aliases.length > 0
      ? ` (${drug1.aliases.join(", ")})`
      : "";
  const alias2 =
    Array.isArray(drug2.aliases) && drug2.aliases.length > 0
      ? ` (${drug2.aliases.join(", ")})`
      : "";

  return `So sánh: ${drug1.name}${alias1} vs ${drug2.name}${alias2}

📋 Công dụng:
  • ${drug1.name}: ${formatField(drug1.usage)}
  • ${drug2.name}: ${formatField(drug2.usage)}

💊 Liều dùng:
  • ${drug1.name}: ${formatField(drug1.dosage)}
  • ${drug2.name}: ${formatField(drug2.dosage)}

⚠️ Tác dụng phụ:
  • ${drug1.name}: ${formatField(drug1.sideEffects, true)}
  • ${drug2.name}: ${formatField(drug2.sideEffects, true)}

🚫 Chống chỉ định:
  • ${drug1.name}: ${formatField(drug1.contraindications, true)}
  • ${drug2.name}: ${formatField(drug2.contraindications, true)}

🗂 Nhóm thuốc:
  • ${drug1.name}: ${formatField(drug1.category)}
  • ${drug2.name}: ${formatField(drug2.category)}

Thông tin chỉ mang tính tham khảo. Hãy tham khảo ý kiến dược sĩ/bác sĩ trước khi thay đổi thuốc.`;
};

// [NEW] Tìm thuốc thay thế
const buildSubstituteDrugReply = (targetDrug, drugs) => {
  const normalizedCategory = normalizeText(targetDrug.category);
  const normalizedUsage = normalizeText(targetDrug.usage);

  // Tìm thuốc cùng nhóm hoặc công dụng tương tự, loại chính nó ra
  const candidates = drugs
    .filter((d) => {
      if (String(d._id) === String(targetDrug._id)) return false;
      const sameCategory = normalizedCategory && normalizeText(d.category) === normalizedCategory;
      const similarUsage =
        normalizedUsage &&
        normalizeText(d.usage) &&
        (normalizeText(d.usage).includes(normalizedUsage.slice(0, 15)) ||
          normalizedUsage.includes(normalizeText(d.usage).slice(0, 15)));
      return sameCategory || similarUsage;
    })
    .slice(0, 5);

  if (candidates.length === 0) {
    return `Mình chưa tìm thấy thuốc thay thế phù hợp cho ${targetDrug.name} trong cơ sở dữ liệu. Bạn nên hỏi dược sĩ để được tư vấn trực tiếp.`;
  }

  const lines = candidates.map((d, i) => {
    const aliasHint =
      Array.isArray(d.aliases) && d.aliases.length > 0 ? ` (${d.aliases.join(", ")})` : "";
    return `${i + 1}. ${d.name}${aliasHint}\n   Công dụng: ${d.usage || EMPTY_VALUE}\n   Nhóm: ${d.category || EMPTY_VALUE}`;
  });

  return `Thuốc thay thế cho ${targetDrug.name} (nhóm: ${targetDrug.category || EMPTY_VALUE}):

${lines.join("\n\n")}

⚠️ Thông tin chỉ mang tính tham khảo. Việc thay thế thuốc cần có chỉ định của bác sĩ hoặc dược sĩ.`;
};

const buildClarificationReply = (typeLabel, candidates, originalMessage) => {
  const displayed = candidates.slice(0, 8);
  const list = displayed.map((c, i) => `${i + 1}. ${c.item.name}`).join("\n");
  const remaining = candidates.length - displayed.length;
  const remainingText = remaining > 0 ? `\n... và ${remaining} kết quả khác.` : "";
  return `Mình tìm thấy nhiều ${typeLabel} phù hợp với "${originalMessage}". Bạn muốn tra cứu thông tin nào?\n\n${list}${remainingText}\n\nBạn có thể nhập số thứ tự (ví dụ: 1) hoặc nhập đúng tên trong danh sách để mình tra cứu chính xác hơn.`;
};

const shouldAskClarification = (candidates) => {
  if (candidates.length <= 1) return false;
  const [best, second] = candidates;
  return best.score < 90 || best.score === second.score;
};

// ─────────────────────────────────────────────
// [NEW] Extract drug names from compare/substitute message
// ─────────────────────────────────────────────
/**
 * Tìm tối đa 2 tên thuốc được nhắc trong message so sánh.
 * Ưu tiên match trực tiếp, sau đó dùng aliases.
 */
const extractDrugsFromMessage = (normalizedMessage, drugs) => {
  const found = [];
  const usedIds = new Set();

  // Pass 1: exact/partial name match
  for (const drug of drugs) {
    const n = normalizeText(drug.name);
    if (n && normalizedMessage.includes(n) && !usedIds.has(String(drug._id))) {
      found.push(drug);
      usedIds.add(String(drug._id));
      if (found.length === 2) return found;
    }
  }

  // Pass 2: alias match
  for (const drug of drugs) {
    if (usedIds.has(String(drug._id))) continue;
    if (!Array.isArray(drug.aliases)) continue;
    const matched = drug.aliases.some((alias) => {
      const na = normalizeText(alias);
      return na && normalizedMessage.includes(na);
    });
    if (matched) {
      found.push(drug);
      usedIds.add(String(drug._id));
      if (found.length === 2) return found;
    }
  }

  return found;
};

// ─────────────────────────────────────────────
// Main reply builder
// ─────────────────────────────────────────────
const buildReplyFromDatabase = async (message, previousMessages = []) => {
  const normalized = normalizeText(message);
  const selectionNumber = parseSelectionNumber(message);
  const clarificationContext =
    selectionNumber !== null ? getLatestClarificationContext(previousMessages) : null;

  const [diseases, drugs] = await Promise.all([Disease.find().lean(), Drug.find().lean()]);

  // ── Xử lý chọn số từ danh sách làm rõ ──────────────────────────
  if (selectionNumber !== null) {
    if (!clarificationContext) {
      return "Bạn hãy nhập số sau khi mình gửi danh sách lựa chọn. Bạn cũng có thể nhập tên bệnh, tên thuốc hoặc mô tả triệu chứng cần tra cứu.";
    }

    const selectedOption = clarificationContext.options.find((o) => o.number === selectionNumber);
    if (!selectedOption) {
      return `Mình không thấy lựa chọn số ${selectionNumber} trong danh sách gần nhất. Bạn vui lòng nhập lại số đang có trong danh sách.`;
    }

    const prevNorm = normalizeText(clarificationContext.previousUserText);

    if (clarificationContext.type === "disease") {
      const selectedDisease = findByDisplayedName(diseases, selectedOption.name);
      if (!selectedDisease) return "Mình chưa tìm lại được bệnh đã chọn. Bạn vui lòng nhập lại tên bệnh hoặc mô tả triệu chứng.";
      const intent = detectIntent(prevNorm, diseaseFieldIntents);
      return intent ? buildFocusedDiseaseReply(selectedDisease, intent) : buildDiseaseReply(selectedDisease, drugs);
    }

    const selectedDrug = findByDisplayedName(drugs, selectedOption.name);
    if (!selectedDrug) return "Mình chưa tìm lại được thuốc đã chọn. Bạn vui lòng nhập lại tên thuốc.";
    const intent = detectIntent(prevNorm, drugFieldIntents);
    return intent ? buildFocusedDrugReply(selectedDrug, intent) : buildDrugReply(selectedDrug);
  }

  const diseaseIntent = detectIntent(normalized, diseaseFieldIntents);
  const drugIntent = detectIntent(normalized, drugFieldIntents);
  const diseaseCandidates = findDiseaseCandidates(normalized, diseases);
  const drugCandidates = findDrugCandidates(normalized, drugs);
  const diseaseMatch = diseaseCandidates[0]?.item || null;
  const drugMatch = drugCandidates[0]?.item || null;

  // ── [NEW] So sánh thuốc ──────────────────────────────────────────
  if (isCompareRequest(normalized)) {
    const foundDrugs = extractDrugsFromMessage(normalized, drugs);

    if (foundDrugs.length >= 2) {
      return buildDrugComparisonReply(foundDrugs[0], foundDrugs[1]);
    }

    // Chỉ tìm được 1 thuốc → hỏi thêm thuốc còn lại
    if (foundDrugs.length === 1) {
      return `Bạn muốn so sánh ${foundDrugs[0].name} với thuốc nào? Vui lòng nhập tên thuốc thứ hai.`;
    }

    // Không tìm được thuốc nào → thử dùng context
    const context = getConversationContext(previousMessages, drugs, diseases);
    if (context?.entityType === "drug") {
      return `Bạn muốn so sánh ${context.entity.name} với thuốc nào? Vui lòng nhập tên thuốc để so sánh.`;
    }

    return "Bạn muốn so sánh những thuốc nào? Vui lòng nhập tên 2 loại thuốc cần so sánh (ví dụ: \"so sánh Paracetamol và Ibuprofen\").";
  }

  // ── [NEW] Tìm thuốc thay thế ─────────────────────────────────────
  if (isSubstituteRequest(normalized)) {
    // Thử tìm trong message
    const foundDrugs = extractDrugsFromMessage(normalized, drugs);
    if (foundDrugs.length >= 1) {
      return buildSubstituteDrugReply(foundDrugs[0], drugs);
    }

    // Thử dùng context từ lịch sử hội thoại
    const context = getConversationContext(previousMessages, drugs, diseases);
    if (context?.entityType === "drug") {
      return buildSubstituteDrugReply(context.entity, drugs);
    }

    return "Bạn muốn tìm thuốc thay thế cho loại thuốc nào? Vui lòng nhập tên thuốc (ví dụ: \"thuốc thay thế cho Paracetamol\").";
  }

  // ── Ưu tiên xử lý "thuốc trị ...", "thuốc nào chữa ..." ──────────
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

  // ── Clarification cho drug/disease ──────────────────────────────
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

  // ── Intent + entity match trực tiếp ─────────────────────────────
  if (diseaseIntent && diseaseMatch) return buildFocusedDiseaseReply(diseaseMatch, diseaseIntent);
  if (drugIntent && drugMatch) return buildFocusedDrugReply(drugMatch, drugIntent);
  if (diseaseMatch && !drugMatch) return buildDiseaseReply(diseaseMatch, drugs);
  if (drugMatch && !diseaseMatch) return buildDrugReply(drugMatch);

  // ── [NEW] Context-aware follow-up (intent không có entity trong message) ──
  if (diseaseIntent || drugIntent) {
    const context = getConversationContext(previousMessages, drugs, diseases);
    if (context) {
      if (drugIntent && context.entityType === "drug") {
        return buildFocusedDrugReply(context.entity, drugIntent);
      }
      if (diseaseIntent && context.entityType === "disease") {
        return buildFocusedDiseaseReply(context.entity, diseaseIntent);
      }
    }
  }

  // ── Symptom matching — [NEW] trả về NHIỀU bệnh có khả năng ──────
  const symptomScores = diseases.map((disease) => {
    let score = 0;
    for (const symptom of disease.symptoms || []) {
      if (normalized.includes(normalizeText(symptom))) score++;
    }
    return { disease, score };
  }).filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score);

  if (symptomScores.length > 0 && symptomScores[0].score >= 2) {
    const multiReply = buildMultipleDiseaseReply(symptomScores, drugs);
    if (multiReply) {
      if (diseaseIntent) return buildFocusedDiseaseReply(symptomScores[0].disease, diseaseIntent);
      return multiReply;
    }
  }

  return "Mình chưa tìm thấy thông tin phù hợp. Bạn có thể mô tả rõ hơn triệu chứng, tên bệnh hoặc tên thuốc giúp mình nhé.";
};

// ─────────────────────────────────────────────
// DB helpers
// ─────────────────────────────────────────────
const saveConversationForUser = async (userId, messages) => {
  if (!userId) return null;
  return ChatConversation.findOneAndUpdate(
    { user: userId },
    { user: userId, messages: normalizeMessages(messages), expiresAt: getExpiryDate() },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

// ─────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────
export const handleChat = async (req, res) => {
  try {
    const message = req.body?.message?.trim();
    if (!message) return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });

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

    if (req.user?.id) await saveConversationForUser(req.user.id, messages);

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