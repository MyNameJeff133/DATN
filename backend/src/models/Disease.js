import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String },
    image: { type: String },
    category: {
      type: String,
      enum: [
        "tim_mach",
        "ho_hap",
        "noi_tiet_chuyen_hoa",
        "tieu_hoa",
        "co_xuong_khop",
        "truyen_nhiem",
        "ung_thu",
        "tam_than",
        "than_kinh",
        "da_lieu",
        "sinh_duc_tiet_nieu",
        "benh_nghe_nghiep",
        "khac",
      ],
      default: "khac",
    },
    symptoms: {
      type: [String],
      required: true,
    },
    causes: {
      type: String,
      default: "",
    },
    treatment: {
      type: String,
      default: "",
    },
    prevention: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Disease", diseaseSchema);
