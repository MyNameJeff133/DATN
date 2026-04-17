import {
  Biohazard,
  Flag,
  LayoutDashboard,
  LogOut,
  Pill,
  Users,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    path: "/admin/users",
    label: "Tài khoản",
    icon: <Users size={18} />,
  },
  {
    path: "/admin/diseases",
    label: "Bệnh lý",
    icon: <Biohazard size={18} />,
  },
  {
    path: "/admin/drugs",
    label: "Thuốc",
    icon: <Pill size={18} />,
  },
  {
    path: "/admin/forum-reports",
    label: "Bài viết",
    icon: <Flag size={18} />,
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let role = "admin";

  if (token) {
    try {
      role = jwtDecode(token).role || "admin";
    } catch {
      role = "admin";
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-portal-urpharmacy", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-gray-900 px-5 py-6 text-white">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Ur Pharmacy</h1>
            <p className="mt-1 text-sm text-gray-400">
              {role === "moderator" ? "Moderator panel" : "Admin panel"}
            </p>
          </div>

          {role === "moderator" && (
            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-100">
              Bạn có thể xử lý bài viết vi phạm và xem dữ liệu hệ thống. Các thao
              tác có thể thực hiện như quản lý thuốc, bệnh và người dùng sẽ ở chế độ chỉ xem.
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-200 transition hover:bg-red-600 hover:text-white"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
