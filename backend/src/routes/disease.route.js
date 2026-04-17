import express from "express";
import authMiddleware, { verifyAdmin } from "../middleware/auth.middleware.js";
import {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
} from "../controllers/disease.controller.js";

const router = express.Router();

router.post("/", authMiddleware, verifyAdmin, createDisease);
router.get("/", getAllDiseases);
router.get("/:id", getDiseaseById);
router.put("/:id", authMiddleware, verifyAdmin, updateDisease);
router.delete("/:id", authMiddleware, verifyAdmin, deleteDisease);

export default router;
