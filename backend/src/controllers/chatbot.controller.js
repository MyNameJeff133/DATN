import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";
import { rules } from "../utils/chatRules.js";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
    }

    const normalized = message.toLowerCase().trim();

    // ===================================
    // 1️⃣ CHAT RULES (ưu tiên cao nhất)
    // ===================================
    for (let rule of rules) {
      for (let keyword of rule.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          return res.json({ reply: rule.reply });
        }
      }
    }

    // ===================================
    // 2️⃣ SUY LUẬN BỆNH
    // ===================================
    const diseases = await Disease.find().populate("relatedDrugs");

    let bestMatch = null;
    let highestScore = 0;

    for (let disease of diseases) {
      let score = 0;

      for (let symptom of disease.symptoms) {
        if (normalized.includes(symptom.toLowerCase())) {
          score++;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = disease;
      }
    }

    // Ít nhất 2 triệu chứng trùng mới kết luận
    if (bestMatch && highestScore >= 2) {
      let severityWarning = "";

      if (bestMatch.severity === "high") {
        severityWarning =
          "\n🚨 Dấu hiệu nghiêm trọng. Bạn nên đến cơ sở y tế sớm.";
      }

      // Danh sách thuốc liên quan
      let drugList = "";
      if (bestMatch.relatedDrugs.length > 0) {
        drugList =
          "\n💊 Thuốc gợi ý: " +
          bestMatch.relatedDrugs.map((d) => d.name).join(", ");
      }

      return res.json({
        reply: `
🩺 Có thể bạn đang gặp: ${bestMatch.name}

📌 Triệu chứng trùng: ${highestScore}

🔍 Nguyên nhân:
${bestMatch.causes}

💡 Điều trị:
${bestMatch.treatment}

🛡 Phòng ngừa:
${bestMatch.prevention}
${drugList}

⚠ Thông tin chỉ mang tính tham khảo.
${severityWarning}
        `,
      });
    }

    // ===================================
    // 3️⃣ TRA CỨU THUỐC
    // ===================================
    const drugs = await Drug.find();

    for (let drug of drugs) {
      if (normalized.includes(drug.name.toLowerCase())) {
        return res.json({
          reply: `
💊 Thuốc: ${drug.name}

📌 Công dụng:
${drug.usage}

📏 Liều dùng:
${drug.dosage}

⚠ Tác dụng phụ:
${drug.sideEffects}

🚫 Chống chỉ định:
${drug.contraindications}

Thông tin chỉ mang tính tham khảo.
          `,
        });
      }
    }

    // ===================================
    // 4️⃣ FALLBACK
    // ===================================
    return res.json({
      reply:
        "Xin lỗi, tôi chưa hiểu rõ. Bạn có thể mô tả triệu chứng cụ thể hơn hoặc nhập tên thuốc.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
