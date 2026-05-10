import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, MessageSquareText, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const statusOptions = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "corrected", label: "Đã sửa" },
  { value: "ignored", label: "Đã bỏ qua" },
  { value: "all", label: "Tất cả" },
];

export default function AdminContentFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/content-feedback?status=${statusFilter}`);
        setFeedbacks(res.data);
      } catch (fetchError) {
        console.error("Fetch content feedback error:", fetchError);
        setError(fetchError.response?.data?.message || "Không thể tải danh sách góp ý");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [statusFilter]);

  const getEditLink = (feedback) =>
    feedback.targetType === "disease"
      ? `/admin/diseases?edit=${feedback.targetId?._id || feedback.targetId}`
      : `/admin/drugs?edit=${feedback.targetId?._id || feedback.targetId}`;

  const handleReview = async (feedback, action) => {
    try {
      setActionLoadingId(`${feedback._id}-${action}`);
      const res = await api.patch(`/content-feedback/${feedback._id}/review`, { action });

      setFeedbacks((prev) =>
        prev.map((item) => (item._id === feedback._id ? res.data.feedback : item)),
      );

      if (action === "corrected") {
        navigate(getEditLink(feedback));
      }
    } catch (reviewError) {
      console.error("Review content feedback error:", reviewError);
      setError(reviewError.response?.data?.message || "Không thể xử lý góp ý");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Xử lý góp ý nội dung"
        description={loading ? "Đang tải dữ liệu..." : `${feedbacks.length} góp ý trong danh sách`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {statusOptions.map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              statusFilter === status.value
                ? "border-cyan-700 bg-cyan-700 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <StateBox>Đang tải danh sách góp ý...</StateBox>
      ) : feedbacks.length === 0 ? (
        <StateBox dashed>Không có góp ý nào trong mục này.</StateBox>
      ) : (
        <div className="space-y-5">
          {feedbacks.map((feedback) => (
            <article key={feedback._id} className="up-card p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                    <MessageSquareText size={16} />
                    {feedback.targetType === "disease" ? "Góp ý bệnh" : "Góp ý thuốc"}
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-slate-950">{feedback.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feedback.content}</p>

                  <div className="mt-4 space-y-1 text-sm text-slate-500">
                    <p>
                      Nội dung bị góp ý:{" "}
                      <span className="font-semibold text-slate-700">
                        {feedback.targetId?.name || "Đã bị xóa"}
                      </span>
                    </p>
                    <p>
                      Gửi bởi{" "}
                      <span className="font-semibold text-slate-700">
                        {feedback.submittedBy?.name || "Người dùng"}
                      </span>
                    </p>
                    {feedback.reviewedBy && (
                      <p>
                        Đã xử lý bởi{" "}
                        <span className="font-semibold text-slate-700">
                          {feedback.reviewedBy?.name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-64">
                  <button
                    onClick={() => handleReview(feedback, "corrected")}
                    disabled={!feedback.targetId || actionLoadingId === `${feedback._id}-corrected`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    <CheckCircle2 size={16} />
                    {actionLoadingId === `${feedback._id}-corrected`
                      ? "Đang xử lý..."
                      : "Đã sửa và mở trang sửa"}
                  </button>

                  <button
                    onClick={() => navigate(getEditLink(feedback))}
                    disabled={!feedback.targetId}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <ExternalLink size={16} />
                    Đi tới trang chỉnh sửa
                  </button>

                  <button
                    onClick={() => handleReview(feedback, "ignored")}
                    disabled={actionLoadingId === `${feedback._id}-ignored`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    <XCircle size={16} />
                    {actionLoadingId === `${feedback._id}-ignored` ? "Đang xử lý..." : "Bỏ qua góp ý"}
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

function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <span className="up-kicker">
        <MessageSquareText size={15} />
        Kiểm duyệt nội dung
      </span>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
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
