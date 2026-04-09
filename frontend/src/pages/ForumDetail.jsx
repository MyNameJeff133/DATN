import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Eye,
  Flag,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import api from "../services/api";
import Comments from "../components/Comments";

export default function ForumDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const handleCommentsCountChange = useCallback((count) => {
    setPost((prev) => (prev ? { ...prev, commentCount: count } : prev));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get(`/forum/${id}`);
      setPost(res.data);
    };

    fetch();
  }, [id]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    const res = await api.post(
      `/forum/${id}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPost(res.data);
  };

  const handleDislike = async () => {
    const token = localStorage.getItem("token");
    const res = await api.post(
      `/forum/${id}/dislike`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPost(res.data);
  };

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      setReportMessage("Vui long nhap ly do bao cao bai viet");
      return;
    }

    try {
      setReportLoading(true);
      setReportMessage("");

      const res = await api.post(`/forum/${id}/report`, {
        reason: reportReason.trim(),
      });

      setPost(res.data.post);
      setReportReason("");
      setReportMessage(res.data.message);
      setShowReportForm(false);
    } catch (error) {
      setReportMessage(
        error.response?.data?.message || "Khong the bao cao bai viet luc nay"
      );
    } finally {
      setReportLoading(false);
    }
  };

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-3xl bg-white px-6 py-10 text-center text-gray-500 shadow-sm">
          Đang tải bài viết...
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-x-hidden bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            Bài viết diễn đàn
          </span>

          <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-gray-900">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Đăng bởi {post.author?.name}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-600">
              <Eye size={16} />
              {post.views || 0} lượt xem
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700">
              <MessageCircle size={16} />
              {post.commentCount || 0} bình luận
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
              <ThumbsUp size={16} />
              {post.likes?.length || 0} lượt thích
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-rose-700">
              <ThumbsDown size={16} />
              {post.dislikes?.length || 0} không thích
            </span>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="whitespace-pre-wrap break-words text-base leading-8 text-gray-700">
              {post.content}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleLike}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <ThumbsUp size={16} />
              Like {post.likes?.length || 0}
            </button>

            <button
              onClick={handleDislike}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              <ThumbsDown size={16} />
              Dislike {post.dislikes?.length || 0}
            </button>

            <button
              onClick={() => {
                setShowReportForm((prev) => !prev);
                setReportMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Flag size={16} />
              Báo cáo
            </button>
          </div>

          {showReportForm && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <Flag size={16} />
                <p className="text-sm font-semibold">Bao cao bai viet vi pham</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-red-700/90">
                Nếu bài viết có nội dung sai lệch, spam hoặc không phù hợp, bạn có
                thể gửi báo cáo để admin kiểm tra.
              </p>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Nhập lý do báo cáo..."
                className="mt-4 min-h-24 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />

              {reportMessage && (
                <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-red-700">
                  {reportMessage}
                </div>
              )}

              <div className="mt-3 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReportForm(false);
                    setReportMessage("");
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReportPost}
                  disabled={reportLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  <Flag size={16} />
                  {reportLoading ? "Đang gửi báo cáo..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          )}
        </div>

        <Comments
          postId={post._id}
          onCountChange={handleCommentsCountChange}
        />
      </div>
    </section>
  );
}
