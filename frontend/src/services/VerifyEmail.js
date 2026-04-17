import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

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
        setMessage(res.data?.message || "Xác thực email thành công 🎉");

        // auto chuyển về login sau 3s
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Token không hợp lệ hoặc đã hết hạn."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow">
        
        {status === "loading" && (
          <>
            <div className="mb-4 animate-spin text-3xl">⏳</div>
            <h2 className="text-lg font-semibold text-gray-700">
              Đang xác thực email...
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 text-4xl">🎉</div>
            <h2 className="text-xl font-bold text-green-600">
              Xác thực thành công
            </h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="mt-5 rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
            >
              Đăng nhập ngay
            </button>

            <p className="mt-3 text-xs text-gray-400">
              Tự động chuyển sau 3 giây...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 text-4xl">❌</div>
            <h2 className="text-xl font-bold text-red-600">
              Xác thực thất bại
            </h2>
            <p className="mt-2 text-sm text-gray-600">{message}</p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => navigate("/register")}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Đăng ký lại
              </button>

              <button
                onClick={() => navigate("/login")}
                className="rounded-lg border px-5 py-2 text-gray-700"
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