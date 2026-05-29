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

const POSTS_PER_PAGE = 10;
const sortOptions = [
  {
    value: "new",
    label: "Bài đăng mới",
    description: "Sắp xếp từ mới đến cũ",
  },
  {
    value: "old",
    label: "Bài đăng cũ",
    description: "Sắp xếp từ cũ đến mới",
  },
  {
    value: "featured",
    label: "Bài đăng nổi bật",
    description: "Nhiều lượt xem và nhiều like",
  },
];

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [sortType, setSortType] = useState("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
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
        setPostsError("");
        const res = await api.get("/forum", {
          params: {
            sort: sortType,
            page: currentPage,
            limit: POSTS_PER_PAGE,
          },
        });
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [];

        setPosts(items);
        setPagination({
          total: typeof res.data?.total === "number" ? res.data.total : items.length,
          totalPages:
            typeof res.data?.totalPages === "number" ? res.data.totalPages : 1,
        });
      } catch (error) {
        setPosts([]);
        setPagination({ total: 0, totalPages: 1 });
        setPostsError(error.response?.data?.message || "Không thể tải danh sách bài viết lúc này");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, refreshKey, sortType]);

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

      await api.post("/forum", {
        title: formData.title,
        content: formData.content,
      });

      setSortType("new");
      setCurrentPage(1);
      setRefreshKey((prev) => prev + 1);
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
          <div className="up-panel mb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Danh sách bài đăng</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hiển thị tối đa {POSTS_PER_PAGE} tiêu đề mỗi trang.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {sortOptions.map((option) => {
                  const active = sortType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortType(option.value);
                        setCurrentPage(1);
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-cyan-700 bg-cyan-700 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:text-cyan-700"
                      }`}
                    >
                      <span className="block text-sm font-bold">{option.label}</span>
                      <span
                        className={`mt-1 block text-xs ${
                          active ? "text-cyan-50" : "text-slate-500"
                        }`}
                      >
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="up-panel px-6 py-10 text-center text-slate-500">
              Đang tải các bài viết trên diễn đàn...
            </div>
          ) : postsError ? (
            <div className="up-panel border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
              {postsError}
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
                      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
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

          {!loading && !postsError && posts.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Trang {currentPage}/{pagination.totalPages} - {pagination.total} bài đăng
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="up-btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trước
                </button>

                {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                      currentPage === page
                        ? "border-cyan-700 bg-cyan-700 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="up-btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
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
    <span className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 ${toneClass}`}>
      {icon}
      {children}
    </span>
  );
}
