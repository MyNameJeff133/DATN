import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flag } from "lucide-react";
import {
  drugCategoryOptions,
  getCategoryLabel,
} from "../constants/medicalData";
import api from "../services/api";
import { getStoredToken } from "../services/authStorage";
import normalizeText from "../utils/normalizeText";

const CONTENT_FEEDBACK_MAX_LENGTH = 1000;

export default function Drugs() {
  const [drugs, setDrugs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          q: searchTerm ? normalizeText(searchTerm) : undefined,
          category: selectedCategory || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };

        const res = await api.get("/drugs", { params });
        const items = Array.isArray(res.data.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
        const total = typeof res.data.total === 'number' ? res.data.total : items.length;
        setDrugs(items);
        setTotalItems(total);
      } catch (err) {
        setDrugs([]);
        setTotalItems(0);
        setError("Không thể tải danh sách thuốc lúc này.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrugs();
  }, [searchTerm, selectedCategory, currentPage, itemsPerPage]);

  useEffect(() => {
    const id = searchParams.get("id");

    if (id && drugs.length > 0) {
      const found = drugs.find((drug) => drug._id === id);
      if (found) setSelectedDrug(found);
    }
  }, [searchParams, drugs]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDrugs = drugs;
  const detailSections = [
    {
      title: "Cong dung",
      content: selectedDrug?.usage,
    },
    {
      title: "Lieu dung",
      content: selectedDrug?.dosage,
    },
    {
      title: "Tac dung phu",
      content: Array.isArray(selectedDrug?.sideEffects)
        ? selectedDrug.sideEffects.join(", ")
        : "",
    },
    {
      title: "Chong chi dinh",
      content: Array.isArray(selectedDrug?.contraindications)
        ? selectedDrug.contraindications.join(", ")
        : "",
    },
  ].filter((section) => section.content);

  const resetFeedbackState = () => {
    setShowFeedbackForm(false);
    setFeedbackTitle("");
    setFeedbackContent("");
    setFeedbackMessage("");
    setFeedbackLoading(false);
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedDrug) return;

    const token = getStoredToken();
    if (!token) {
      setFeedbackMessage("Vui long dang nhap de gui gop y.");
      return;
    }

    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      setFeedbackMessage("Vui long nhap day du tieu de va noi dung.");
      return;
    }

    if (feedbackContent.trim().length > CONTENT_FEEDBACK_MAX_LENGTH) {
      setFeedbackMessage(`Noi dung gop y toi da ${CONTENT_FEEDBACK_MAX_LENGTH} ky tu.`);
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackMessage("");
      const res = await api.post("/content-feedback", {
        targetType: "drug",
        targetId: selectedDrug._id,
        title: feedbackTitle,
        content: feedbackContent,
      });
      setFeedbackMessage(res.data.message);
      setFeedbackTitle("");
      setFeedbackContent("");
      // Keep form open and show success state
      setFeedbackSuccess(true);
      setShowFeedbackForm(true);
    } catch (error) {
      setFeedbackMessage(error.response?.data?.message || "Không thể gửi góp ý lúc này.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="up-page">
      <div className="up-section mb-6 px-5 py-7 sm:px-7">
        <div className="max-w-3xl">
          <span className="up-kicker">
            Tra cứu thuốc
          </span>
          <h2 className="up-title mt-3">Tìm thuốc và thông tin cần biết</h2>
          <p className="up-muted mt-3">
            Chọn thuốc để xem nhanh danh mục, công dụng, liều dùng và các lưu ý quan trọng.
          </p>
        </div>
      </div>

      <div className="up-panel mb-6 grid gap-3 md:grid-cols-[1fr_260px]">
        <input
          type="text"
          placeholder="Tìm theo tên thuốc..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          className="up-field"
        />

        <select
          value={selectedCategory}
          onChange={(event) => {
            setSelectedCategory(event.target.value);
            setCurrentPage(1);
          }}
          className="up-field"
        >
          <option value="">Tất cả danh mục</option>
          {drugCategoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="up-panel p-10 text-center text-slate-500">
          Đang tải danh sách thuốc...
        </div>
      )}

      {!loading && error && (
        <div className="up-panel border-red-200 bg-red-50 p-10 text-center text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(paginatedDrugs) && paginatedDrugs.length > 0 ? (
          paginatedDrugs.map((drug) => (
            <button
              key={drug._id}
              onClick={() => setSelectedDrug(drug)}
              className="up-card overflow-hidden text-left"
            >
              {drug.image && (
                <img
                  src={drug.image}
                  alt={drug.name}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full object-cover"
                />
              )}

              <div className="p-5">
                <h3 className="text-xl font-semibold text-slate-900">{drug.name}</h3>
                <span className="mt-3 inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  {getCategoryLabel(drugCategoryOptions, drug.category)}
                </span>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{drug.usage}</p>
                <div className="mt-4 text-sm font-bold text-cyan-700">Xem chi tiết</div>
              </div>
            </button>
          ))
        ) : (
          <div className="up-panel col-span-full p-10 text-center text-slate-500">
            Không tìm thấy thuốc phù hợp
          </div>
        )}
      </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="up-btn-secondary px-4 py-2 disabled:opacity-50"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`rounded px-4 py-2 text-sm ${
                currentPage === index + 1 ? "bg-cyan-700 text-white" : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="up-btn-secondary px-4 py-2 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {selectedDrug && (
        <div className="up-modal-backdrop">
          <div className="mx-auto flex h-full max-w-4xl items-center justify-center">
            <div className="up-modal">
              <div className="relative overflow-hidden border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
                <button
                  onClick={() => {
                    setSelectedDrug(null);
                    resetFeedbackState();
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("id");
                      return next;
                    });
                  }}
                  className="up-btn-secondary absolute right-4 top-4 px-3 py-1.5"
                >
                  Đóng
                </button>

                <div className="pr-20">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {getCategoryLabel(drugCategoryOptions, selectedDrug.category)}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {selectedDrug.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Xem nhanh công dụng, liều dùng và những lưu ý trước khi sử dụng.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {selectedDrug.image && (
                  <img
                    src={selectedDrug.image}
                    alt={selectedDrug.name}
                    loading="lazy"
                    decoding="async"
                    className="mb-6 h-56 w-full rounded-2xl object-cover sm:h-72"
                  />
                )}

                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Thông tin thuốc</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Các mục dưới đây giúp bạn đọc nhanh thông tin quan trọng nhất.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowFeedbackForm((prev) => !prev);
                      setFeedbackMessage("");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700"
                  >
                    <Flag size={16} />
                    Góp ý nội dung
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {detailSections.map((section) => (
                    <div
                      key={section.title}
                      className="up-panel"
                    >
                      <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {section.title}
                      </h5>
                      <p className="mt-2 text-sm leading-7 text-slate-700">{section.content}</p>
                    </div>
                  ))}
                </div>

                {feedbackSuccess && (
                  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-5">
                    <p className="text-sm font-medium text-green-700">{feedbackMessage || "Góp ý đã được gửi thành công."}</p>
                  </div>
                )}

                {showFeedbackForm && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                    <h4 className="text-lg font-semibold text-slate-900">Gửi góp ý cho nội dung này</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Nếu bạn thấy thông tin chưa rõ ràng hoặc cần bổ sung, hãy gửi góp ý ngắn gọn.
                    </p>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={feedbackTitle}
                  onChange={(event) => setFeedbackTitle(event.target.value)}
                  className="up-field mt-4"
                />
                <textarea
                  placeholder="Nội dung góp ý"
                  value={feedbackContent}
                  onChange={(event) => setFeedbackContent(event.target.value)}
                  maxLength={CONTENT_FEEDBACK_MAX_LENGTH}
                  className="up-field mt-3 min-h-28"
                />
                    <div className="mt-2 text-right text-xs text-slate-500">
                      {feedbackContent.length}/{CONTENT_FEEDBACK_MAX_LENGTH} ký tự
                    </div>
                    {feedbackMessage && (
                      <p className="mt-3 text-sm text-slate-700">{feedbackMessage}</p>
                    )}
                    <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetFeedbackState}
                    className="up-btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={feedbackLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:bg-amber-300"
                  >
                    {feedbackLoading ? "Đang gửi..." : "Gửi góp ý"}
                  </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
