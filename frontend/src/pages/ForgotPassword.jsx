import { useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setSuccess(res.data.message || "Đã gửi mã OTP");
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể gửi mã xác nhận",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await api.post("/auth/reset-password", {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });

      setSuccess(
        res.data.message || "Đổi mật khẩu thành công",
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể đổi mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Khôi phục tài khoản của bạn"
      sideTitle="Bảo mật tài khoản"
    >
      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-7">
          <div className="space-y-5">
            <AuthInput
              label="Email"
              icon={<Mail className="shrink-0 text-cyan-700" size={24} />}
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <button
            disabled={loading}
            className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-cyan-800 to-cyan-600 px-5 text-lg font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,116,144,0.9)] transition hover:from-cyan-900 hover:to-cyan-700 disabled:opacity-70"
          >
            {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
            <ArrowRight size={24} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Quay lại đăng nhập
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-7">
          <div className="space-y-5">
            <AuthInput
              label="Mã OTP"
              icon={<KeyRound className="shrink-0 text-cyan-700" size={24} />}
              type="text"
              placeholder="Nhập mã OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <AuthInput
              label="Mật khẩu mới"
              icon={
                <LockKeyhole
                  className="shrink-0 text-cyan-700"
                  size={24}
                />
              }
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
              {success}
            </div>
          )}

          <button
            disabled={loading}
            className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-cyan-800 to-cyan-600 px-5 text-lg font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,116,144,0.9)] transition hover:from-cyan-900 hover:to-cyan-700 disabled:opacity-70"
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            <ArrowRight size={24} />
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

function AuthInput({ label, icon, ...props }) {
  return (
    <label className="block">
      <span className="text-base font-bold text-slate-800">
        {label}
      </span>

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