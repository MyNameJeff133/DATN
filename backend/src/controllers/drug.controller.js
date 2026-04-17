import Drug from "../models/Drug.js";

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

const normalizeDrugPayload = (payload) => ({
  ...payload,
  name: payload.name?.trim(),
  image: payload.image?.trim?.() || "",
  category: payload.category || "khac",
  usage: payload.usage?.trim?.() || "",
  dosage: payload.dosage?.trim?.() || "",
  sideEffects: normalizeList(payload.sideEffects),
  contraindications: normalizeList(payload.contraindications),
});

/**
 * Lay danh sach thuoc
 */
export const getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find().sort({ createdAt: -1 });
    res.json(drugs);
  } catch (error) {
    res.status(500).json({ message: "Loi server" });
  }
};

export const createDrug = async (req, res) => {
  try {
    const drug = await Drug.create(normalizeDrugPayload(req.body));
    res.status(201).json(drug);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(
      req.params.id,
      normalizeDrugPayload(req.body),
      { new: true, runValidators: true },
    );

    if (!drug) {
      return res.status(404).json({ message: "Khong tim thay thuoc" });
    }

    res.json(drug);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndDelete(req.params.id);

    if (!drug) {
      return res.status(404).json({ message: "Khong tim thay thuoc" });
    }

    res.json({ message: "Da xoa thuoc" });
  } catch (error) {
    res.status(500).json({ message: "Loi server" });
  }
};

/**
 * Lay chi tiet thuoc
 */
export const getDrugById = async (req, res) => {
  const drug = await Drug.findById(req.params.id);
  if (!drug) {
    return res.status(404).json({ message: "Khong tim thay thuoc" });
  }
  res.json(drug);
};

/**
 * Tim thuoc theo ten hoac cong dung
 * ?keyword=paracetamol
 */
export const searchDrug = async (req, res) => {
  const { keyword } = req.query;

  const drugs = await Drug.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { usage: { $regex: keyword, $options: "i" } },
    ],
  });

  res.json(drugs);
};
