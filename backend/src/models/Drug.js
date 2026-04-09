import mongoose from "mongoose";

const drugSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },

    category: {
      type: String,
      enum: [
        "khang_sinh",
        "giam_dau",
        "ha_sot",
        "tim_mach",
        "noi_tiet",
        "tieu_hoa",
        "than_kinh",
        "co_xuong_khop",
        "da_lieu",
        "khac",
      ],
      default: "khac",
    },

    usage: String,
    dosage: String,

    sideEffects: [String],
    contraindications: [String],
  },
  { timestamps: true },
);

// để search nhanh
drugSchema.index({ name: 1 });

//   // Thuốc thuộc về ai
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     default: null, // null = thuốc hệ thống do admin tạo
//   }

// }, { timestamps: true });
export default mongoose.model("Drug", drugSchema);
