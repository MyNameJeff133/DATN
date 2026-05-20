import Disease from "../models/Disease.js";
import { createVietnameseSearchRegex } from "../utils/searchRegex.js";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeDiseasePayload = (payload) => ({
  ...payload,
  name: payload.name?.trim(),
  description: payload.description?.trim?.() || "",
  image: payload.image?.trim?.() || "",
  category: payload.category || "khac",
  symptoms: normalizeList(payload.symptoms),
  causes: payload.causes?.trim?.() || "",
  treatment: payload.treatment?.trim?.() || "",
  prevention: payload.prevention?.trim?.() || "",
  severity: payload.severity || "low",
});

export const createDisease = async (req, res) => {
  try {
    const disease = new Disease(normalizeDiseasePayload(req.body));
    await disease.save();
    res.status(201).json(disease);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDiseases = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const category = req.query.category;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const requestedLimit = parseInt(req.query.limit, 10) || 12;
    const limit = Math.min(Math.max(requestedLimit, 1), 200);

    const filter = {};
    if (category) filter.category = category;

    if (q) {
      const regex = createVietnameseSearchRegex(q);
      filter.$or = [
        { name: regex },
        { description: regex },
        { symptoms: regex },
        { category: regex },
      ];
    }

    const total = await Disease.countDocuments(filter);
    const diseases = await Disease.find(filter)
      .collation({ locale: "vi", strength: 1 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ items: diseases, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ message: "Không tìm thấy bệnh" });
    res.json(disease);
  } catch (error) {
    res.status(400).json({ message: "Id bệnh không hợp lệ" });
  }
};

export const updateDisease = async (req, res) => {
  try {
    const updated = await Disease.findByIdAndUpdate(
      req.params.id,
      normalizeDiseasePayload(req.body),
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDisease = async (req, res) => {
  try {
    await Disease.findByIdAndDelete(req.params.id);
    res.json({ message: "Disease deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
