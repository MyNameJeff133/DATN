import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";
import api from "../services/api";

export default function AdminForumReports() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  const fetchReportedPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/forum/admin/reports");
      setPosts(res.data);
    } catch (fetchError) {
      console.error("Load forum reports failed:", fetchError);
      setError(
        fetchError.response?.status === 403
          ? "Tài khoản hiện tại không có quyền vào khu xử lý bài viết."
          : fetchError.response?.data?.message || "Không thể tải danh sách báo cáo",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const handleModerate = async (postId, action) => {
    try {
      setActionLoadingId(`${postId}-${action}`);
      const res = await api.patch(`/forum/admin/${postId}/moderate`, { action });

      if (res.data.affectedUser?.isBanned) {
        alert("Tài khoản tác giả đã bị khóa vì vi phạm quá 3 lần.");
      }

      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (moderateError) {
      console.error("Moderate report failed:", moderateError);
      setError(moderateError.response?.data?.message || "Không thể cập nhật trạng thái bài viết");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <span className="up-kicker">
          <AlertTriangle size={15} />
          Kiểm duyệt forum
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Xử lý bài viết vi phạm</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {loading ? "Đang tải dữ liệu..." : `${posts.length} bài viết đang chờ xử lý`}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <StateBox>Đang tải danh sách báo cáo...</StateBox>
      ) : posts.length === 0 ? (
        <StateBox dashed>Không có báo cáo nào cần xử lý.</StateBox>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <article key={post._id} className="up-card p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700">
                    <AlertTriangle size={16} />
                    {post.reportCount || post.reports?.length || 0} báo cáo
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-950">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{post.content}</p>
                  <p className="mt-4 text-sm text-slate-500">
                    Đăng bởi{" "}
                    <span className="font-semibold text-slate-700">{post.author?.name}</span>
                  </p>

                  <div className="mt-5 space-y-3">
                    {(post.reports || []).map((report, index) => (
                      <div
                        key={`${post._id}-report-${index}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-sm font-bold text-slate-950">
                          {report.user?.name || "Người dùng"} báo cáo
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{report.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-60">
                  <button
                    onClick={() => handleModerate(post._id, "delete")}
                    disabled={actionLoadingId === `${post._id}-delete`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    <Trash2 size={16} />
                    {actionLoadingId === `${post._id}-delete`
                      ? "Đang xử lý..."
                      : "Xóa bài viết +1 vi phạm"}
                  </button>

                  <button
                    onClick={() => handleModerate(post._id, "dismiss")}
                    disabled={actionLoadingId === `${post._id}-dismiss`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-300"
                  >
                    <ShieldCheck size={16} />
                    {actionLoadingId === `${post._id}-dismiss`
                      ? "Đang xử lý..."
                      : "Bỏ qua báo cáo"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StateBox({ dashed = false, children }) {
  return (
    <div
      className={`rounded-3xl border bg-white px-6 py-12 text-center text-slate-500 shadow-sm ${
        dashed ? "border-dashed border-slate-300" : "border-slate-200"
      }`}
    >
      {children}
    </div>
  );
}
