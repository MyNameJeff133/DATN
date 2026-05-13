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
  const [info, setInfo] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setNeedsVerification(false);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      if (!saveAuthStorage(res.data.token, res.data.user)) {
        setError("Không thể lưu thông tin đăng nhập");
        return;
      }

      navigate("/");
    } catch (err) {
      const responseMessage = err.response?.data?.message || "Không thể đăng nhập lúc này";
      setError(responseMessage);
      setNeedsVerification(err.response?.data?.code === "EMAIL_NOT_VERIFIED");
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email để gửi lại xác thực");
      return;
    }

    try {
      setResending(true);
      setError("");
      setInfo("");
      const res = await api.post("/auth/resend-verification", { email: email.trim() });
      setInfo(res.data?.message || "Đã gửi lại email xác thực");
    } catch (err) {
      setError(err.response?.data?.message || "Không gửi lại được email xác thực");
    } finally {
      setResending(false);
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
          <AuthInput
            label="Email"
            icon={<Mail className="shrink-0 text-cyan-700" size={24} />}
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthInput
            label="Mật khẩu"
            icon={<LockKeyhole className="shrink-0 text-cyan-700" size={24} />}
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
            {needsVerification && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-3 block font-bold text-red-800 underline disabled:opacity-60"
              >
                {resending ? "Đang gửi lại..." : "Gửi lại email xác thực"}
              </button>
            )}
          </div>
        )}

        {info && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {info}
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

function AuthInput({ label, icon, ...props }) {
  return (
    <label className="block">
      <span className="text-base font-bold text-slate-800">{label}</span>
      <div className="mt-3 flex min-h-16 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
        {icon}
        <input
          {...props}
          className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}
