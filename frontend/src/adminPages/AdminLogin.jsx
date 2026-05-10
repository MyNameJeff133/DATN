import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAuthStorage } from "../services/authStorage";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/admin-login", { email, password });

      if (!["admin", "moderator"].includes(res.data.user?.role)) {
        setError("Tài khoản này không có quyền truy cập khu vực quản trị");
        return;
      }

      if (!saveAuthStorage(res.data.token, res.data.user)) {
        setError("Không thể lưu thông tin đăng nhập");
        return;
      }

      navigate("/admin/dashboard");
    } catch (loginError) {
      setError(loginError.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32rem),linear-gradient(180deg,#f8fafc,#eef7fb)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.6)] lg:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-gradient-to-br from-cyan-800 via-cyan-700 to-blue-700 p-10 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <ShieldCheck size={30} />
              </div>
              <h1 className="mt-8 text-4xl font-black leading-tight">
                Khu quản trị Ur Pharmacy
              </h1>
              <p className="mt-4 text-base leading-8 text-cyan-50">
                Không gian dành cho admin và kiểm duyệt viên để vận hành dữ liệu, góp ý và nội dung cộng đồng.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-sm leading-7 text-cyan-50">
              Chỉ tài khoản có quyền admin hoặc moderator mới có thể truy cập khu vực này.
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-10">
          <span className="up-kicker">
            <ShieldCheck size={15} />
            Admin portal
          </span>
          <h2 className="mt-4 text-3xl font-black text-slate-950">Đăng nhập quản trị</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Admin và kiểm duyệt viên đăng nhập tại đây.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700" size={18} />
                <input
                  type="email"
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="up-field pl-10"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Mật khẩu</span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700" size={18} />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="up-field pl-10"
                />
              </div>
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="up-btn-primary w-full">
              Đăng nhập
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
