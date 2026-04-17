import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const initialPasswordData = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialShowPassword = {
  old: false,
  new: false,
  confirm: false,
};

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");
  const [user, setUser] = useState({ name: "", email: "", role: "" });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileError, setProfileError] = useState("");
  const [passwordData, setPasswordData] = useState(initialPasswordData);
  const [showPassword, setShowPassword] = useState(initialShowPassword);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setProfileError("");
      const res = await api.get("/auth/profile");
      setUser({
        name: res.data?.name || "",
        email: res.data?.email || "",
        role: res.data?.role || "",
      });
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Không thể tải được thông tin cá nhân"
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setProfileError("");
      const res = await api.put("/auth/profile", { name: user.name.trim() });
      setUser({
        name: res.data?.name || "",
        email: res.data?.email || "",
        role: res.data?.role || "",
      });
      setEditing(false);
      alert("Cập nhật thành công");
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Cập nhật thông tin thất bại"
      );
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[name];
      delete nextErrors.api;
      return nextErrors;
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ";
    }

    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (passwordData.newPassword === passwordData.oldPassword) {
      newErrors.newPassword = "Mật khẩu mới không được trùng mật khẩu cũ";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    try {
      await api.put("/auth/change-password", passwordData);
      setPasswordData(initialPasswordData);
      setShowPassword(initialShowPassword);
      setErrors({});
      alert("Đổi mật khẩu thành công");
    } catch (err) {
      setErrors({
        api: err.response?.data?.message || "Lỗi server",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
       "Bạn chắc chắn muốn xóa tài khoản? Toàn bộ bài viết, bình luận và lịch sử chat liên quan sẽ bị xóa."
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete("/auth/profile");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    } catch (err) {
      setProfileError(err.response?.data?.message || "Không thể xóa tài khoản");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Trang cá nhân</h2>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setTab("info")}
            className={`rounded px-4 py-2 text-sm ${
              tab === "info" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Thông tin cá nhân
          </button>

          <button
            onClick={() => setTab("password")}
            className={`rounded px-4 py-2 text-sm ${
              tab === "password" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        {tab === "info" && (
          <div className="mt-6">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm"
                value={user.email}
                disabled
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Họ tên
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>

            {profileError && (
              <p className="mb-4 text-sm text-red-600">{profileError}</p>
            )}

            {!editing ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {deleteLoading ? "Đang xóa..." : "Xóa tài khoản"}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Lưu
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setProfileError("");
                    fetchProfile();
                  }}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "password" && (
          <div className="mt-6">
            <div className="relative mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mật khẩu cũ
              </label>
              <input
                type={showPassword.old ? "text" : "password"}
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              />
              <span
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, old: !prev.old }))
                }
                className="absolute right-3 top-10 cursor-pointer text-gray-500"
              >
                {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
              )}
            </div>

            <div className="relative mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <input
                type={showPassword.new ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              />
              <span
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-10 cursor-pointer text-gray-500"
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div className="relative mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              />
              <span
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-10 cursor-pointer text-gray-500"
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.api && <p className="mb-4 text-sm text-red-600">{errors.api}</p>}

            <button
              onClick={handleChangePassword}
              className="rounded bg-red-500 px-4 py-2 text-sm font-medium text-white"
            >
              Đổi mật khẩu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
