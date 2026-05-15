import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../components/AuthLayout";
import { passwordPolicyMessage, validatePasswordPolicy } from "../utils/passwordPolicy";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!validatePasswordPolicy(password)) {
      setError(passwordPolicyMessage);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        res.data?.message ||
          "Tài khoản đã được tạo thành công. Vui lòng kiểm tra email trước khi đăng nhập."
      );
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký"
      subtitle="Tạo tài khoản để sử dụng đầy đủ dịch vụ của Ur Pharmacy"
      sideTitle="Bắt đầu cùng Ur Pharmacy"
      sideDescription="Tạo tài khoản để lưu hồ sơ, theo dõi nội dung y tế và nhận hỗ trợ chăm sóc sức khỏe thuận tiện hơn."
    >
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-5">
          <AuthField
            label="Họ và tên"
            icon={<User size={24} />}
            type="text"
            placeholder="Nhập họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <AuthField
            label="Email"
            icon={<Mail size={24} />}
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block">
            <span className="text-base font-bold text-slate-800">Mật khẩu</span>
            <div className="mt-3 flex min-h-16 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
              <LockKeyhole className="shrink-0 text-cyan-700" size={24} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="shrink-0 text-slate-400 transition hover:text-slate-600"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </label>

          <p className="-mt-2 text-sm leading-6 text-slate-500">
            Mật khẩu phải có hơn 6 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
          </p>

          <AuthField
            label="Nhập lại mật khẩu"
            icon={<LockKeyhole size={24} />}
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-5 py-5 text-sm text-emerald-800 shadow-sm">
            <p className="font-semibold text-emerald-900">Đăng ký thành công</p>
            <p className="mt-1 leading-6">{success}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              onClick={() => navigate("/login")}
            >
              Đến trang đăng nhập
            </button>
          </div>
        )}

        <button
          disabled={isSubmitting}
          className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-cyan-800 to-cyan-600 px-5 text-lg font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,116,144,0.9)] transition hover:from-cyan-900 hover:to-cyan-700 disabled:cursor-not-allowed disabled:from-cyan-300 disabled:to-cyan-300"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          {!isSubmitting && <ArrowRight size={24} />}
        </button>

        <p className="text-center text-base text-slate-500">
          Đã có tài khoản?{" "}
          <button
            type="button"
            className="font-bold text-cyan-700 hover:text-cyan-800"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthField({ label, icon, ...props }) {
  return (
    <label className="block">
      <span className="text-base font-bold text-slate-800">{label}</span>
      <div className="mt-3 flex min-h-16 items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 transition focus-within:border-cyan-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-100">
        <span className="shrink-0 text-cyan-700">{icon}</span>
        <input
          {...props}
          className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}
