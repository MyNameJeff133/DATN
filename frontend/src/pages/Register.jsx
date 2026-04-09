import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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

    if (!name || !email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(
        "Tài khoản đã được tạo thành công. Chúng tôi vừa gửi email xác thực đến hộp thư của bạn. Vui lòng kiểm tra email trước khi đăng nhập."
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
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-10">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]"
      >
        <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Tạo tài khoản để tham gia vào hệ thống Ur Pharmacy.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Ten"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mat khau"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-400 transition hover:text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Nhap lai mat khau"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-4 py-4 text-sm text-emerald-800 shadow-sm">
            <p className="font-semibold text-emerald-900">
              Đăng ký thành công
            </p>
            <p className="mt-1 leading-6">{success}</p>
            <button
              type="button"
              className="mt-3 inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              onClick={() => navigate("/login")}
            >
              Đến trang đăng nhập
            </button>
          </div>
        )}

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-green-600 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {isSubmitting ? "Dang xu ly..." : "Dang ky"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <button
            type="button"
            className="font-medium text-blue-600 hover:text-blue-700"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </div>
  );
}
