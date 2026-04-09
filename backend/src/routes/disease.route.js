// src/routes/disease.route.js
import express from "express";
import {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
} from "../controllers/disease.controller.js";

const router = express.Router();

// Tạo bệnh mới
router.post("/", createDisease);

// Lấy danh sách tất cả bệnh
router.get("/", getAllDiseases);

// Lấy chi tiết bệnh theo ID
router.get("/:id", getDiseaseById);

// Cập nhật bệnh theo ID
router.put("/:id", updateDisease);

// Xóa bệnh theo ID
router.delete("/:id", deleteDisease);

export default router;
