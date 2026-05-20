import express from "express";
import authMiddleware, { requireRoles, verifyAdmin } from "../middleware/auth.middleware.js";
import {
  getAllDrugs,
  createDrug,
  getDrugById,
  updateDrug,
  deleteDrug,
} from "../controllers/drug.controller.js";

const router = express.Router();

router.get("/", getAllDrugs);
router.get("/:id", getDrugById);
router.post("/", authMiddleware, verifyAdmin, createDrug);
router.put("/:id", authMiddleware, requireRoles("admin", "moderator"), updateDrug);
router.delete("/:id", authMiddleware, verifyAdmin, deleteDrug);

export default router;
