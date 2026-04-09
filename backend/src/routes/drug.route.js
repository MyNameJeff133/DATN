import express from "express";
import {
  getAllDrugs,
  createDrug,
  updateDrug,
  deleteDrug,
} from "../controllers/drug.controller.js";


const router = express.Router();

/* ========= Public ========= */

// Ai cũng tra cứu được
// router.get("/", getAllDrugs);
// router.get("/search", searchDrug);
// router.get("/:id", getDrugById);


/* ========= Protected ========= */
router.get("/", getAllDrugs);
router.post("/", createDrug);
router.put("/:id", updateDrug);
router.delete("/:id", deleteDrug);

export default router;
