import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token không tồn tại.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.data?.message || "Xác thực email thành công");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-cyan-100 border-t-cyan-700" />
            <h2 className="text-lg font-bold text-slate-700">Đang xác thực email...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 text-4xl">✓</div>
            <h2 className="text-xl font-bold text-emerald-600">Xác thực thành công</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Đăng nhập ngay
            </button>

            <p className="mt-3 text-xs text-slate-400">Tự động chuyển sau 3 giây...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 text-4xl">!</div>
            <h2 className="text-xl font-bold text-red-600">Xác thực thất bại</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => navigate("/register")}
                className="rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-800"
              >
                Đăng ký lại
              </button>

              <button
                onClick={() => navigate("/login")}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Về trang đăng nhập
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
