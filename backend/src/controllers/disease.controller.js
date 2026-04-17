import Disease from "../models/Disease.js";

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
    const diseases = await Disease.find();
    res.json(diseases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ message: "Not found" });
    res.json(disease);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
