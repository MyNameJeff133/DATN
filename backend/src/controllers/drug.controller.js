import Drug from "../models/Drug.js";

/**
 * Lấy danh sách thuốc
 */
export const getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find().sort({ createdAt: -1 });
    res.json(drugs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const createDrug = async (req, res) => {
  try {
    const drug = await Drug.create(req.body);
    res.status(201).json(drug);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDrug = async (req, res) => {
  try {
    const drug = await Drug.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!drug) {
      return res.status(404).json({ message: "Không tìm thấy thuốc" });
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
      return res.status(404).json({ message: "Không tìm thấy thuốc" });
    }

    res.json({ message: "Đã xoá thuốc" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
/**
 * Lấy chi tiết thuốc
 */
export const getDrugById = async (req, res) => {
  const drug = await Drug.findById(req.params.id);
  if (!drug) {
    return res.status(404).json({ message: "Không tìm thấy thuốc" });
  }
  res.json(drug);
};

/**
 * Tìm thuốc theo tên hoặc công dụng
 * ?keyword=paracetamol
 */
export const searchDrug = async (req, res) => {
  const { keyword } = req.query;

  const drugs = await Drug.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { usage: { $regex: keyword, $options: "i" } }
    ]
  });

  res.json(drugs);
};

