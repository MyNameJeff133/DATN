import express from "express";
import authMiddleware, { verifyAdmin } from "../middleware/auth.middleware.js";
import {
  getAllDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
} from "../controllers/drug.controller.js";

const router = express.Router();

router.get("/", getAllDrugs);
router.post("/", authMiddleware, verifyAdmin, createDrug);
router.put("/:id", authMiddleware, verifyAdmin, updateDrug);
router.delete("/:id", authMiddleware, verifyAdmin, deleteDrug);

export default router;
