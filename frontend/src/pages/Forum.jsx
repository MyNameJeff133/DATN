import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleUserRound,
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
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let currentUser = null;

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      currentUser = null;
    }
  }

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
      setFormError("Vui long nhap day du tieu de va noi dung bai viet");
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
      setFormSuccess("Dang bai thanh cong");
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      setFormError(
        error.response?.data?.message || "Khong the dang bai viet luc nay"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              Diễn đàn cộng đồng
            </span>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Cùng trao đổi kiến thức sức khỏe và kinh nghiệm thực tế
            </h1>
            <p className="mt-3 text-base leading-8 text-gray-600">
              Theo dấu các bài viết mới, đọc chia sẻ hữu ích và tham gia thảo luận cùng cộng đồng Ur Pharmacy. 
              Đây là nơi bạn có thể đặt câu hỏi, chia sẻ kinh nghiệm và nhận được sự hỗ trợ từ những người có cùng mối quan tâm về sức khỏe.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                <PenSquare size={16} />
                Đăng bài mới
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                Chia sẻ câu hỏi hoặc kinh nghiệm của bạn
              </h2>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Sau khi đăng nhập, bạn có thể tạo bài viết mới để nhận được tư vấn
                và trao đổi với cộng đồng.
              </p>
            </div>
          </div>

          {!token ? (
            <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-6">
              <p className="text-sm leading-7 text-blue-900">
                Bạn cần đăng nhập để đăng bài trên forum.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
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
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Mô tả vấn đề, kinh nghiệm hoặc câu hỏi của bạn..."
                className="min-h-36 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {submitting ? "Đang đăng bài..." : "Đăng bài"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-500 shadow-sm">
              Đang tải các bài viết trên diễn đàn...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-500">
              Chưa có bài viết nào trong diễn đàn.
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="cursor-pointer rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => navigate(`/forum/${post._id}`)}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                      <h2 className="text-2xl font-semibold leading-tight text-gray-900">
                        {post.title}
                      </h2>
                      <p className="mt-3 line-clamp-2 text-sm leading-7 text-gray-600">
                        {post.content}
                      </p>
                      <p className="mt-4 text-sm text-gray-500">
                        Đăng bởi{" "}
                        <span className="font-medium text-gray-700">
                          {post.author?.name}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-blue-700">
                        Xem chi tiết
                      </span>
                    </div>
                  </div>

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
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-gray-600">
                      <Clock size={16} />
                      {dayjs(post.createdAt).fromNow()}
                    </span>
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
