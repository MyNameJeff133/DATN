import {
  Biohazard,
  Flag,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Pill,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAuthStorage, getStoredToken } from "../services/authStorage";

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { path: "/admin/users", label: "Tài khoản", icon: <Users size={18} /> },
  { path: "/admin/diseases", label: "Bệnh lý", icon: <Biohazard size={18} /> },
  { path: "/admin/drugs", label: "Thuốc", icon: <Pill size={18} /> },
  { path: "/admin/content-feedback", label: "Góp ý", icon: <MessageSquareQuote size={18} /> },
  { path: "/admin/forum-reports", label: "Bài viết", icon: <Flag size={18} /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getStoredToken();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pendingFlags, setPendingFlags] = useState({
    contentFeedback: false,
    forumReports: false,
  });
  let role = "admin";

  if (token) {
    try {
      role = jwtDecode(token).role || "admin";
    } catch {
      role = "admin";
    }
  }

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/admin-portal-urpharmacy", { replace: true });
  };

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!token) {
      setPendingFlags({
        contentFeedback: false,
        forumReports: false,
      });
      return;
    }

    const fetchPendingFlags = async () => {
      try {
        const [feedbackRes, reportsRes] = await Promise.all([
          api.get("/content-feedback?status=pending"),
          api.get("/forum/admin/reports"),
        ]);

        setPendingFlags({
          contentFeedback: (feedbackRes.data || []).length > 0,
          forumReports: (reportsRes.data || []).length > 0,
        });
      } catch {
        setPendingFlags({
          contentFeedback: false,
          forumReports: false,
        });
      }
    };

    fetchPendingFlags();
    const intervalId = window.setInterval(fetchPendingFlags, 30000);
    return () => window.clearInterval(intervalId);
  }, [token]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/10">
            <ShieldCheck size={21} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-950">Ur Pharmacy</h1>
            <p className="text-sm text-slate-500">
              {role === "moderator" ? "Khu kiểm duyệt" : "Khu quản trị"}
            </p>
          </div>
        </div>
      </div>

      {role === "moderator" && (
        <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Bạn có thể xử lý bài viết vi phạm, duyệt góp ý và chỉnh sửa nội dung hiện có.
        </div>
      )}

      <nav className="flex-1 space-y-1 px-4 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const hasPendingDot =
            (item.path === "/admin/content-feedback" && pendingFlags.contentFeedback) ||
            (item.path === "/admin/forum-reports" && pendingFlags.forumReports);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-50 text-cyan-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={isActive ? "text-cyan-700" : "text-slate-500"}>
                  {item.icon}
                </span>
                {item.label}
              </span>
              {hasPendingDot && (
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.14)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-4">
        <button onClick={handleLogout} className="up-btn-danger w-full">
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32rem),linear-gradient(180deg,#f8fafc,#eef7fb)] text-slate-900">
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-black text-slate-950">Ur Pharmacy</div>
            <div className="text-sm text-slate-500">
              {role === "moderator" ? "Moderator panel" : "Admin panel"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
            aria-label="Mở menu quản trị"
          >
            {mobileSidebarOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-69px)] lg:min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200/80 bg-white/95 shadow-sm backdrop-blur lg:block">
          {sidebar}
        </aside>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden">
            <div className="h-full w-72 bg-white shadow-2xl">{sidebar}</div>
          </div>
        )}

        <main className="flex-1 px-4 py-5 md:px-6 md:py-7">
          <div className="up-admin-surface">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
