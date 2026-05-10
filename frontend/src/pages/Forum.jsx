import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Eye,
  MessageCircle,
  PenSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../services/api";
import { getStoredToken } from "../services/authStorage";

dayjs.extend(relativeTime);

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const navigate = useNavigate();
  const token = getStoredToken();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/forum");
        setPosts(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết");
      setFormSuccess("");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setFormSuccess("");

      const res = await api.post("/forum", {
        title: formData.title,
        content: formData.content,
      });

      setPosts((prev) => [res.data, ...prev]);
      setFormData({ title: "", content: "" });
      setFormSuccess("Đăng bài thành công");
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setFormError(error.response?.data?.message || "Không thể đăng bài viết lúc này");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-8">
      <div className="up-page py-0">
        <div className="up-section p-7 md:p-8">
          <div className="max-w-3xl">
            <span className="up-kicker">Diễn đàn cộng đồng</span>
            <h1 className="up-title mt-4">
              Cùng trao đổi kiến thức sức khỏe và kinh nghiệm thực tế
            </h1>
            <p className="up-muted mt-3">
              Theo dõi các bài viết mới, đọc chia sẻ hữu ích và tham gia thảo luận cùng cộng đồng Ur Pharmacy.
            </p>
          </div>
        </div>

        <div className="up-section mt-8 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="up-kicker">
                <PenSquare size={16} />
                Đăng bài mới
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-950">
                Chia sẻ câu hỏi hoặc kinh nghiệm của bạn
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Sau khi đăng nhập, bạn có thể tạo bài viết mới để nhận tư vấn và trao đổi với cộng đồng.
              </p>
            </div>
          </div>

          {!token ? (
            <div className="mt-6 rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/70 px-5 py-6">
              <p className="text-sm leading-7 text-cyan-900">
                Bạn cần đăng nhập để đăng bài trên forum.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="up-btn-primary mt-4"
              >
                Đăng nhập để đăng bài
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreatePost} className="mt-6 space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề bài viết"
                className="up-field"
              />

              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Mô tả vấn đề, kinh nghiệm hoặc câu hỏi của bạn..."
                className="up-field min-h-36"
              />

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {formSuccess}
                </div>
              )}

              <div className="flex justify-end">
                <button type="submit" disabled={submitting} className="up-btn-primary">
                  {submitting ? "Đang đăng bài..." : "Đăng bài"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="up-panel px-6 py-10 text-center text-slate-500">
              Đang tải các bài viết trên diễn đàn...
            </div>
          ) : posts.length === 0 ? (
            <div className="up-panel border-dashed px-6 py-12 text-center text-slate-500">
              Chưa có bài viết nào trong diễn đàn.
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="up-card cursor-pointer p-6"
                  onClick={() => navigate(`/forum/${post._id}`)}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                      <h2 className="text-2xl font-bold leading-tight text-slate-950">
                        {post.title}
                      </h2>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-600">
                        {post.content}
                      </p>
                      <p className="mt-4 text-sm text-slate-500">
                        Đăng bởi{" "}
                        <span className="font-semibold text-slate-700">
                          {post.author?.name}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
                        Xem chi tiết
                      </span>
                    </div>
                  </div>

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
                    <MetaPill icon={<Clock size={16} />}>{dayjs(post.createdAt).fromNow()}</MetaPill>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
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
