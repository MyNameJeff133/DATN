import Drug from "../models/Drug.js";
import Disease from "../models/Disease.js";

const MAX_SEARCH_LENGTH = 80;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchAll = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({ drugs: [], diseases: [] });
    }

    if (q.length > MAX_SEARCH_LENGTH) {
      return res.status(400).json({
        message: `Tu khoa tim kiem toi da ${MAX_SEARCH_LENGTH} ky tu`,
      });
    }

    const searchRegex = new RegExp(escapeRegex(q), "i");

    const drugs = await Drug.find({
      $or: [
        { name: searchRegex },
        { usage: searchRegex },
        { category: searchRegex },
      ],
    }).limit(5);

    const diseases = await Disease.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { symptoms: searchRegex },
        { category: searchRegex },
      ],
    }).limit(5);

    res.json({ drugs, diseases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
