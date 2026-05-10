import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Eye, Flag, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import api from "../services/api";
import Comments from "../components/Comments";
import { getStoredToken } from "../services/authStorage";

const POST_REPORT_MAX_LENGTH = 300;

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
    const token = getStoredToken();
    const res = await api.post(
      `/forum/${id}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setPost(res.data);
  };

  const handleDislike = async () => {
    const token = getStoredToken();
    const res = await api.post(
      `/forum/${id}/dislike`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setPost(res.data);
  };

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      setReportMessage("Vui lòng nhập lý do báo cáo bài viết");
      return;
    }

    if (reportReason.trim().length > POST_REPORT_MAX_LENGTH) {
      setReportMessage(`Lý do báo cáo tối đa ${POST_REPORT_MAX_LENGTH} ký tự`);
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
      setReportMessage(error.response?.data?.message || "Không thể báo cáo bài viết lúc này");
    } finally {
      setReportLoading(false);
    }
  };

  if (!post) {
    return (
      <div className="up-page max-w-4xl">
        <div className="up-panel px-6 py-10 text-center text-slate-500">
          Đang tải bài viết...
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-x-hidden py-8">
      <div className="up-page max-w-4xl py-0">
        <div className="up-section overflow-hidden p-6 sm:p-8">
          <span className="up-kicker">Bài viết diễn đàn</span>

          <h1 className="mt-4 break-words text-3xl font-bold leading-tight text-slate-950">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-slate-500">Đăng bởi {post.author?.name}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <MetaPill icon={<Eye size={16} />}>{post.views || 0} lượt xem</MetaPill>
            <MetaPill icon={<MessageCircle size={16} />} tone="cyan">
              {post.commentCount || 0} bình luận
            </MetaPill>
            <MetaPill icon={<ThumbsUp size={16} />} tone="emerald">
              {post.likes?.length || 0} lượt thích
            </MetaPill>
            <MetaPill icon={<ThumbsDown size={16} />} tone="rose">
              {post.dislikes?.length || 0} không thích
            </MetaPill>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="whitespace-pre-wrap break-words text-base leading-8 text-slate-700">
              {post.content}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleLike}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <ThumbsUp size={16} />
              Like {post.likes?.length || 0}
            </button>

            <button
              onClick={handleDislike}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-600"
            >
              <ThumbsDown size={16} />
              Dislike {post.dislikes?.length || 0}
            </button>

            <button
              onClick={() => {
                setShowReportForm((prev) => !prev);
                setReportMessage("");
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Flag size={16} />
              Báo cáo
            </button>
          </div>

          {showReportForm && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <div className="flex items-center gap-2 text-red-700">
                <Flag size={16} />
                <p className="text-sm font-bold">Báo cáo bài viết vi phạm</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-red-700/90">
                Nếu bài viết có nội dung sai lệch, spam hoặc không phù hợp, bạn có thể gửi báo cáo để admin kiểm tra.
              </p>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Nhập lý do báo cáo..."
                maxLength={POST_REPORT_MAX_LENGTH}
                className="mt-4 min-h-24 w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
              <div className="mt-2 text-right text-xs text-red-700/80">
                {reportReason.length}/{POST_REPORT_MAX_LENGTH} ký tự
              </div>

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
                  className="up-btn-secondary px-4 py-2.5"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReportPost}
                  disabled={reportLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  <Flag size={16} />
                  {reportLoading ? "Đang gửi báo cáo..." : "Gửi báo cáo"}
                </button>
              </div>
            </div>
          )}
        </div>

        <Comments postId={post._id} onCountChange={handleCommentsCountChange} />
      </div>
    </section>
  );
}

function MetaPill({ icon, tone = "slate", children }) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-600",
    cyan: "bg-cyan-50 text-cyan-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${toneClass}`}>
      {icon}
      {children}
    </span>
  );
}
