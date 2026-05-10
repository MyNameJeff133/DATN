import {
  ArrowRight,
  Biohazard,
  FileText,
  Flag,
  Pill,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const panels = [
  {
    title: "Quản lý tài khoản",
    desc: "Theo dõi người dùng, phân quyền và giữ cho cộng đồng vận hành ổn định.",
    icon: <Users size={24} />,
    path: "/admin/users",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    title: "Quản lý bệnh lý",
    desc: "Cập nhật kho kiến thức về bệnh, triệu chứng và hướng điều trị.",
    icon: <Biohazard size={24} />,
    path: "/admin/diseases",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Quản lý thuốc",
    desc: "Tổ chức danh mục thuốc, liều dùng và thông tin cảnh báo quan trọng.",
    icon: <Pill size={24} />,
    path: "/admin/drugs",
    accent: "from-indigo-500 to-sky-500",
  },
  {
    title: "Nội dung hệ thống",
    desc: "Không gian để mở rộng thêm các module kiểm soát và báo cáo sau này.",
    icon: <FileText size={24} />,
    path: "/admin/dashboard",
    accent: "from-slate-700 to-slate-900",
  },
  {
    title: "Báo cáo bài viết",
    desc: "Xử lý nhanh những bài đăng cần kiểm duyệt để giữ chất lượng diễn đàn.",
    icon: <Flag size={24} />,
    path: "/admin/forum-reports",
    accent: "from-rose-500 to-orange-500",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="relative overflow-hidden rounded-[30px] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.2),transparent_32%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-sky-100">
              <ShieldCheck size={14} />
              Admin workspace
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              Điều phối hệ thống rõ ràng và nhẹ mắt hơn
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Truy cập nhanh các khu vực quản trị chính, xử lý nội dung đang chờ và giữ trải nghiệm vận hành gọn gàng hơn cho admin và kiểm duyệt viên.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Trạng thái" value="Ổn định" />
            <Metric label="Ưu tiên" value="Kiểm duyệt" />
            <Metric label="Mục tiêu" value="Sạch và nhanh" />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Khu vực quản trị</h2>
            <p className="mt-1 text-sm text-slate-500">
              Những luồng công việc được dùng nhiều nhất trong quá trình vận hành.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {panels.map((panel) => (
            <button
              key={panel.title}
              onClick={() => navigate(panel.path)}
              className="up-card group overflow-hidden p-6 text-left"
            >
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${panel.accent} text-white shadow-lg`}
              >
                {panel.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{panel.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{panel.desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700 transition group-hover:text-cyan-800">
                Đi tới khu vực
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-300">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
