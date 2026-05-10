import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAuthStorage } from "../services/authStorage";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      if (!saveAuthStorage(res.data.token, res.data.user)) {
        setError("Không thể lưu thông tin đăng nhập");
        return;
      }

      navigate("/");
    } catch (err) {
      setError("Sai email hoặc mật khẩu");
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Tiếp tục hành trình chăm sóc sức khỏe cùng chúng tôi"
      sideTitle="Chào mừng quay trở lại"
    >
      <form onSubmit={handleLogin} className="space-y-7">
        <div className="space-y-5">
          <label className="block">
            <span className="text-base font-bold text-slate-800">Email</span>
            <div className="mt-3 flex min-h-16 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
              <Mail className="shrink-0 text-cyan-700" size={24} />
              <input
                type="email"
                placeholder="Nhập email"
                className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-base font-bold text-slate-800">Mật khẩu</span>
            <div className="mt-3 flex min-h-16 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
              <LockKeyhole className="shrink-0 text-cyan-700" size={24} />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-cyan-800 to-cyan-600 px-5 text-lg font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,116,144,0.9)] transition hover:from-cyan-900 hover:to-cyan-700">
          Đăng nhập
          <ArrowRight size={24} />
        </button>

        <p className="text-center text-base text-slate-500">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            className="font-bold text-cyan-700 transition hover:text-cyan-800"
            onClick={() => navigate("/register")}
          >
            Đăng ký ngay
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
