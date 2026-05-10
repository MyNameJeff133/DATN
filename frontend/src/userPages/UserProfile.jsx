import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAuthStorage } from "../services/authStorage";

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
      setProfileError(err.response?.data?.message || "Không thể tải được thông tin cá nhân");
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
      setProfileError(err.response?.data?.message || "Cập nhật thông tin thất bại");
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
      clearAuthStorage();
      navigate("/", { replace: true });
    } catch (err) {
      setProfileError(err.response?.data?.message || "Không thể xóa tài khoản");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="up-page max-w-4xl">
      <div className="up-section overflow-hidden">
        <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-white px-6 py-7">
          <span className="up-kicker">
            <UserRound size={15} />
            Tài khoản
          </span>
          <h2 className="up-title mt-3">Trang cá nhân</h2>
          <p className="up-muted mt-2">
            Quản lý thông tin tài khoản, bảo mật mật khẩu và quyền riêng tư.
          </p>
        </div>

        <div className="p-6">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <TabButton active={tab === "info"} onClick={() => setTab("info")}>
              Thông tin cá nhân
            </TabButton>
            <TabButton active={tab === "password"} onClick={() => setTab("password")}>
              Đổi mật khẩu
            </TabButton>
          </div>

          {tab === "info" && (
            <div className="mt-6 space-y-5">
              <Field label="Email" value={user.email} disabled />
              <Field
                label="Họ tên"
                name="name"
                value={user.name}
                onChange={handleChange}
                disabled={!editing}
              />

              {profileError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {profileError}
                </p>
              )}

              {!editing ? (
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setEditing(true)} className="up-btn-primary">
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="up-btn-danger"
                  >
                    {deleteLoading ? "Đang xóa..." : "Xóa tài khoản"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleSave} className="up-btn-primary">
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setProfileError("");
                      fetchProfile();
                    }}
                    className="up-btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "password" && (
            <div className="mt-6 space-y-5">
              <PasswordField
                label="Mật khẩu cũ"
                name="oldPassword"
                value={passwordData.oldPassword}
                show={showPassword.old}
                onChange={handlePasswordChange}
                onToggle={() => setShowPassword((prev) => ({ ...prev, old: !prev.old }))}
                error={errors.oldPassword}
              />
              <PasswordField
                label="Mật khẩu mới"
                name="newPassword"
                value={passwordData.newPassword}
                show={showPassword.new}
                onChange={handlePasswordChange}
                onToggle={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                error={errors.newPassword}
              />
              <PasswordField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                show={showPassword.confirm}
                onChange={handlePasswordChange}
                onToggle={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                error={errors.confirmPassword}
              />

              {errors.api && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.api}
                </p>
              )}

              <button onClick={handleChangePassword} className="up-btn-primary">
                <LockKeyhole size={17} />
                Đổi mật khẩu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active ? "bg-white text-cyan-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input {...props} className="up-field disabled:bg-slate-100 disabled:text-slate-500" />
    </label>
  );
}

function PasswordField({ label, show, onToggle, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <div className="relative">
        <input {...props} type={show ? "text" : "password"} className="up-field pr-12" />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
