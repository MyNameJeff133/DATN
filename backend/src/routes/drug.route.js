import express from "express";
import authMiddleware, { requireRoles, verifyAdmin } from "../middleware/auth.middleware.js";
import {
  getAllDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
} from "../controllers/drug.controller.js";

const router = express.Router();

router.get("/", getAllDrugs);
router.post("/", authMiddleware, verifyAdmin, createDrug);
router.put("/:id", authMiddleware, requireRoles("admin", "moderator"), updateDrug);
router.delete("/:id", authMiddleware, verifyAdmin, deleteDrug);

export default router;
