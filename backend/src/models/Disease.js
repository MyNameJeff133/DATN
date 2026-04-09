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

    // Nhóm bệnh (theo phân loại y khoa)
    category: {
      type: String,
      enum: [
        "tim_mach", // Tim mạch
        "ho_hap", // Hô hấp
        "noi_tiet_chuyen_hoa", // Nội tiết - chuyển hóa
        "tieu_hoa", // Tiêu hóa
        "co_xuong_khop", // Cơ xương khớp
        "truyen_nhiem", // Truyền nhiễm
        "ung_thu", // Ung thư
        "tam_than", // Tâm thần - hành vi
        "than_kinh", // Thần kinh
        "da_lieu", // Da và mô dưới da
        "sinh_duc_tiet_nieu", // Sinh dục - tiết niệu
        "benh_nghe_nghiep", // Bệnh nghề nghiệp
        "khac",
      ],
      default: "khac",
    },

    // Danh sách triệu chứng
    symptoms: {
      type: [String],
      required: true,
    },

    // Nguyên nhân
    causes: {
      type: String,
      default: "",
    },

    // Điều trị
    treatment: {
      type: String,
      default: "",
    },

    // Phòng ngừa
    prevention: {
      type: String,
      default: "",
    },

    // Mức độ nguy hiểm
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    // Thuốc liên quan
    relatedDrugs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drug",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Disease", diseaseSchema);
