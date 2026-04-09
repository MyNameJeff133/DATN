import Disease from "../models/Disease.js";

export const createDisease = async (req, res) => {
  try {
    const disease = new Disease(req.body);
    await disease.save();
    res.status(201).json(disease);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find().populate("relatedDrugs");
    res.json(diseases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiseaseById = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id).populate("relatedDrugs");
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
      req.body,
      { new: true }
    );
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
