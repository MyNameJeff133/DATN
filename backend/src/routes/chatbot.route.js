import express from "express";
import Disease from "../models/Disease.js";
import Drug from "../models/Drug.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const message = req.body?.message?.trim();

  try {
    if (!message) {
      return res.status(400).json({
        error: "Vui long nhap noi dung can tra cuu",
      });
    }

    const disease = await Disease.findOne({
      $or: [
        { name: { $regex: message, $options: "i" } },
        { symptoms: { $regex: message, $options: "i" } },
        { description: { $regex: message, $options: "i" } },
      ],
    }).populate("relatedDrugs", "name");

    if (disease) {
      const symptomText = Array.isArray(disease.symptoms)
        ? disease.symptoms.join(", ")
        : "Dang cap nhat";
      const relatedDrugText =
        disease.relatedDrugs?.length > 0
          ? disease.relatedDrugs.map((drug) => drug.name).join(", ")
          : "Chua co thuoc lien quan trong he thong";

      return res.json({
        reply: `Benh phu hop: ${disease.name}

Trieu chung thuong gap: ${symptomText}
Mo ta ngan: ${disease.description || "Dang cap nhat"}
Huong dieu tri tham khao: ${disease.treatment || "Dang cap nhat"}
Thuoc lien quan: ${relatedDrugText}

Luu y: Thong tin nay chi de tham khao, khong thay the chan doan cua bac si.`,
      });
    }

    const drug = await Drug.findOne({
      $or: [
        { name: { $regex: message, $options: "i" } },
        { usage: { $regex: message, $options: "i" } },
      ],
    });

    if (drug) {
      return res.json({
        reply: `Thuoc phu hop: ${drug.name}

Cong dung: ${drug.usage || "Dang cap nhat"}
Lieu dung tham khao: ${drug.dosage || "Dang cap nhat"}
Tac dung phu: ${
          drug.sideEffects?.length ? drug.sideEffects.join(", ") : "Dang cap nhat"
        }
Chong chi dinh: ${
          drug.contraindications?.length
            ? drug.contraindications.join(", ")
            : "Dang cap nhat"
        }

Luu y: Doc ky huong dan su dung va hoi y kien nhan vien y te neu ban dang co benh nen.`,
      });
    }

    return res.json({
      reply:
        "Minh chua tim thay thong tin phu hop. Ban thu mo ta ro hon trieu chung, ten benh hoac ten thuoc giup minh nhe.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
