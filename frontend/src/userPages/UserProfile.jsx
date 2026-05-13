import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
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
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [postSearchTerm, setPostSearchTerm] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (tab === "posts") {
      fetchMyPosts();
    }
  }, [tab]);

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

  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError("");
      const res = await api.get("/forum/me/posts");
      setMyPosts(res.data || []);
    } catch (err) {
      setMyPosts([]);
      setPostsError(err.response?.data?.message || "Không thể tải danh sách bài viết.");
    } finally {
      setPostsLoading(false);
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
        "Bạn chắc chắn muốn xóa tài khoản? Toàn bộ bài viết, bình luận và lịch sử chat liên quan sẽ bị xóa.",
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

  const filteredMyPosts = myPosts.filter((post) => {
    const keyword = postSearchTerm.trim().toLowerCase();
    if (!keyword) return true;

    return (
      post.title?.toLowerCase().includes(keyword) ||
      post.content?.toLowerCase().includes(keyword)
    );
  });

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
          <div className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <TabButton active={tab === "info"} onClick={() => setTab("info")}>
              Thông tin cá nhân
            </TabButton>
            <TabButton active={tab === "password"} onClick={() => setTab("password")}>
              Đổi mật khẩu
            </TabButton>
            <TabButton active={tab === "posts"} onClick={() => setTab("posts")}>
              Bài viết đã đăng
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

          {tab === "posts" && (
            <div className="mt-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Bài viết đã đăng</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tra cứu nhanh các bài bạn đã tạo trong diễn đàn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchMyPosts}
                  disabled={postsLoading}
                  className="up-btn-secondary"
                >
                  {postsLoading ? "Đang tải..." : "Làm mới"}
                </button>
              </div>

              <input
                type="text"
                value={postSearchTerm}
                onChange={(event) => setPostSearchTerm(event.target.value)}
                placeholder="Tìm theo tiêu đề hoặc nội dung bài viết..."
                className="up-field mb-4"
              />

              {postsLoading && (
                <div className="up-panel p-8 text-center text-slate-500">
                  Đang tải bài viết đã đăng...
                </div>
              )}

              {!postsLoading && postsError && (
                <div className="up-panel border-red-200 bg-red-50 p-8 text-center text-red-700">
                  {postsError}
                </div>
              )}

              {!postsLoading && !postsError && myPosts.length === 0 && (
                <div className="up-panel border-dashed p-8 text-center text-slate-500">
                  Bạn chưa đăng bài viết nào.
                </div>
              )}

              {!postsLoading && !postsError && myPosts.length > 0 && filteredMyPosts.length === 0 && (
                <div className="up-panel border-dashed p-8 text-center text-slate-500">
                  Không tìm thấy bài viết phù hợp.
                </div>
              )}

              {!postsLoading && !postsError && filteredMyPosts.length > 0 && (
                <div className="space-y-4">
                  {filteredMyPosts.map((post) => (
                    <article key={post._id} className="up-card p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                              <FileText size={14} />
                              {getPostStatusLabel(post.status)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-950">{post.title}</h4>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                            {post.content}
                          </p>
                        </div>

                        {post.status === "hidden" ? (
                          <span className="rounded-2xl bg-slate-100 px-4 py-2.5 text-center text-sm font-bold text-slate-500">
                            Không thể mở
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate(`/forum/${post._id}`)}
                            className="up-btn-primary shrink-0"
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <PostMetric icon={<Eye size={14} />}>{post.views || 0} lượt xem</PostMetric>
                        <PostMetric icon={<MessageCircle size={14} />}>
                          {post.commentCount || 0} bình luận
                        </PostMetric>
                        <PostMetric icon={<ThumbsUp size={14} />}>
                          {post.likes?.length || 0} thích
                        </PostMetric>
                        <PostMetric icon={<ThumbsDown size={14} />}>
                          {post.dislikes?.length || 0} không thích
                        </PostMetric>
                      </div>
                    </article>
                  ))}
                </div>
              )}
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

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getPostStatusLabel(status) {
  const labels = {
    active: "Đang hiển thị",
    reported: "Đang được xem xét",
    resolved: "Đã xử lý",
    hidden: "Đã ẩn",
  };

  return labels[status] || "Không rõ trạng thái";
}

function PostMetric({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
      {icon}
      {children}
    </span>
  );
}
