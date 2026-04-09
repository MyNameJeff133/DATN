import { Biohazard, FileText, Flag, Pill, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const panels = [
  {
    title: "Quản lý tài khoản",
    desc: "Xem danh sách người dùng và duyệt tài khoản.",
    icon: <Users size={24} />,
    path: "/admin/users",
  },
  {
    title: "Quản lý bệnh lý",
    desc: "Thêm, sửa và xóa thông tin bệnh.",
    icon: <Biohazard size={24} />,
    path: "/admin/diseases",
  },
  {
    title: "Quản lý thuốc",
    desc: "Cập nhật danh mục thuốc và liều dùng.",
    icon: <Pill size={24} />,
    path: "/admin/drugs",
  },
  {
    title: "Nội dung hệ thống",
    desc: "Khu vực để mở rộng thêm các chức năng sau này.",
    icon: <FileText size={24} />,
    path: "/admin/dashboard",
  },
  {
    title: "Báo cáo bài viết",
    desc: "Xem và xử lý các bài viết bị báo cáo vi phạm.",
    icon: <Flag size={24} />,
    path: "/admin/forum-reports",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Quản lý các chức năng chính của hệ thống Ur Pharmacy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {panels.map((panel) => (
          <button
            key={panel.title}
            onClick={() => navigate(panel.path)}
            className="rounded-xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 text-blue-600">{panel.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900">{panel.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{panel.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
