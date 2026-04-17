import { useEffect, useState } from "react";
import { AlertTriangle, EyeOff, RotateCcw, ShieldCheck } from "lucide-react";
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
      console.error("Loi tai bao cao bai viet:", fetchError);
      setError(
        fetchError.response?.status === 403
          ? "Tai khoan hien tai khong co quyen vao khu xu ly bai viet."
          : fetchError.response?.data?.message || "Khong the tai danh sach bao cao"
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
        alert("Tai khoan tac gia da bi khoa vi vi pham qua 3 lan.");
      }

      setPosts((prev) => {
        if (action === "hide") {
          return prev.map((post) =>
            post._id === postId ? { ...post, ...res.data.post } : post
          );
        }

        return prev.filter((post) => post._id !== postId);
      });
    } catch (moderateError) {
      console.error("Loi xu ly bao cao:", moderateError);
      setError(
        moderateError.response?.data?.message || "Khong the cap nhat trang thai bai viet"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Xu ly bai viet vi pham</h1>
        <p className="mt-2 text-gray-600">
          {loading ? "Dang tai du lieu..." : `${posts.length} bai viet dang cho xu ly`}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white px-6 py-10 text-center text-gray-500 shadow-sm">
          Dang tai danh sach bao cao...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-500">
          Khong co bao cao nao can xu ly.
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <div key={post._id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                    <AlertTriangle size={16} />
                    {post.reportCount || post.reports?.length || 0} bao cao
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {post.content}
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Dang boi <span className="font-medium text-gray-700">{post.author?.name}</span>
                  </p>

                  <div className="mt-5 space-y-3">
                    {(post.reports || []).map((report, index) => (
                      <div
                        key={`${post._id}-report-${index}`}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {report.user?.name || "Nguoi dung"} bao cao
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{report.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-56">
                  <button
                    onClick={() => handleModerate(post._id, "hide")}
                    disabled={actionLoadingId === `${post._id}-hide`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    <EyeOff size={16} />
                    {actionLoadingId === `${post._id}-hide` ? "Dang xu ly..." : "An bai viet"}
                  </button>

                  <button
                    onClick={() => handleModerate(post._id, "dismiss")}
                    disabled={actionLoadingId === `${post._id}-dismiss`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    <ShieldCheck size={16} />
                    {actionLoadingId === `${post._id}-dismiss` ? "Dang xu ly..." : "Bo qua bao cao"}
                  </button>

                  {post.status === "hidden" && (
                    <button
                      onClick={() => handleModerate(post._id, "restore")}
                      disabled={actionLoadingId === `${post._id}-restore`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      <RotateCcw size={16} />
                      {actionLoadingId === `${post._id}-restore` ? "Dang xu ly..." : "Khoi phuc bai viet"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
