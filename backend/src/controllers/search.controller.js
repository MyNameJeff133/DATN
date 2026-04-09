import Drug from "../models/Drug.js";
import Disease from "../models/Disease.js";

export const searchAll = async (req, res) => {
  try {
    const q = req.query.q;

    const drugs = await Drug.find({
      name: { $regex: q, $options: "i" }
    }).limit(5);

    const diseases = await Disease.find({
      name: { $regex: q, $options: "i" }
    }).limit(5);

    res.json({ drugs, diseases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};