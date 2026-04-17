export const diseaseCategoryOptions = [
  { value: "tim_mach", label: "Tim mạch" },
  { value: "ho_hap", label: "Ho hấp" },
  { value: "noi_tiet_chuyen_hoa", label: "Nội tiết - chuyển hóa" },
  { value: "tieu_hoa", label: "Tiêu hóa" },
  { value: "co_xuong_khop", label: "Cơ xương khớp" },
  { value: "truyen_nhiem", label: "Truyền nhiễm" },
  { value: "ung_thu", label: "Ung thư" },
  { value: "tam_than", label: "Tâm thần - hành vi" },
  { value: "than_kinh", label: "Thận kinh" },
  { value: "da_lieu", label: "Da liệu" },
  { value: "sinh_duc_tiet_nieu", label: "Sinh dục - tiết niệu" },
  { value: "benh_nghe_nghiep", label: "Bệnh nghề nghiệp" },
  { value: "khac", label: "Khác" },
];

export const drugCategoryOptions = [
  { value: "khang_sinh", label: "Kháng sinh" },
  { value: "giam_dau", label: "Giảm đau" },
  { value: "ha_sot", label: "Hạ sốt" },
  { value: "tim_mach", label: "Tim mạch" },
  { value: "noi_tiet", label: "Nội tiết" },
  { value: "tieu_hoa", label: "Tiêu hóa" },
  { value: "than_kinh", label: "Than kinh" },
  { value: "co_xuong_khop", label: "Cơ xương khớp" },
  { value: "da_lieu", label: "Da liệu" },
  { value: "khac", label: "Khác" },
];

export const severityOptions = [
  { value: "low", label: "Nhẹ", color: "bg-green-100 text-green-700" },
  {
    value: "medium",
    label: "Trung bình",
    color: "bg-yellow-100 text-yellow-700",
  },
  { value: "high", label: "Nặng", color: "bg-red-100 text-red-700" },
];

export const getSeverityLabel = (severity) =>
  severityOptions.find((item) => item.value === severity)?.label || severity;

export const getSeverityClasses = (severity) =>
  severityOptions.find((item) => item.value === severity)?.color ||
  "bg-gray-100 text-gray-700";

export const getCategoryLabel = (options, value) =>
  options.find((item) => item.value === value)?.label || "Khác";
