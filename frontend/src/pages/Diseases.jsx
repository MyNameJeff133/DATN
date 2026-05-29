import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flag } from "lucide-react";
import {
  diseaseCategoryOptions,
  getSeverityLabel,
} from "../constants/medicalData";
import SeverityBadge from "./SeverityBadge";
import api from "../services/api";
import { getStoredToken } from "../services/authStorage";

const CONTENT_FEEDBACK_MAX_LENGTH = 1000;

export default function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        setError("");
        const params = {
          q: searchTerm.trim() || undefined,
          category: selectedGroup || undefined,
          page: currentPage,
          limit: itemsPerPage,
        };

        const res = await api.get("/diseases", { params });
        const items = Array.isArray(res.data.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
        const total = typeof res.data.total === 'number' ? res.data.total : items.length;
        setDiseases(items);
        setTotalItems(total);
      } catch (err) {
        setDiseases([]);
        setTotalItems(0);
        setError(err.response?.data?.message || "Không thể tải danh sách bệnh lúc này.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, [searchTerm, selectedGroup, currentPage, itemsPerPage]);

  useEffect(() => {
    const id = searchParams.get("id");

    if (!id) {
      return;
    }

    const found = diseases.find((disease) => disease._id === id);
    if (found) {
      setSelectedDisease(found);
      return;
    }

    const fetchSelectedDisease = async () => {
      try {
        const res = await api.get(`/diseases/${id}`);
        setSelectedDisease(res.data);
      } catch {
        setSelectedDisease(null);
      }
    };

    fetchSelectedDisease();
  }, [searchParams, diseases]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDiseases = diseases;
  const detailSections = [
    selectedDisease?.description && {
      title: "Mô tả",
      content: selectedDisease.description,
    },
    {
      title: "Triệu chứng",
      content: Array.isArray(selectedDisease?.symptoms)
        ? selectedDisease.symptoms.join(", ")
        : "",
    },
    selectedDisease?.causes && {
      title: "Nguyên nhân",
      content: selectedDisease.causes,
    },
    selectedDisease?.treatment && {
      title: "Điều trị",
      content: selectedDisease.treatment,
    },
    selectedDisease?.prevention && {
      title: "Phòng ngừa",
      content: selectedDisease.prevention,
    },
  ].filter(Boolean);

  const resetFeedbackState = () => {
    setShowFeedbackForm(false);
    setFeedbackTitle("");
    setFeedbackContent("");
    setFeedbackMessage("");
    setFeedbackLoading(false);
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedDisease) return;

    const token = getStoredToken();
    if (!token) {
      setFeedbackMessage("Vui lòng đăng nhập để gửi góp ý.");
      return;
    }

    if (!feedbackTitle.trim() || !feedbackContent.trim()) {
      setFeedbackMessage("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    if (feedbackContent.trim().length > CONTENT_FEEDBACK_MAX_LENGTH) {
      setFeedbackMessage(`Nội dung góp ý tối đa ${CONTENT_FEEDBACK_MAX_LENGTH} ký tự.`);
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackMessage("");
      const res = await api.post("/content-feedback", {
        targetType: "disease",
        targetId: selectedDisease._id,
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Tra cứu bệnh
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Tìm thông tin bệnh để hiểu hơn</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            Chọn bệnh để xem nhanh mức độ, triệu chứng, nguyên nhân và hướng phòng ngừa.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
        <input
          type="text"
          placeholder="Tìm theo tên bệnh..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        />

        <select
          value={selectedGroup}
          onChange={(event) => {
            setSelectedGroup(event.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        >
          <option value="">Tất cả nhóm bệnh</option>
          {diseaseCategoryOptions.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
      </div>

          {loading && (
        <div className="up-panel p-10 text-center text-slate-500">
          Đang tải danh sách bệnh...
        </div>
      )}

      {!loading && error && (
        <div className="up-panel border-red-200 bg-red-50 p-10 text-center text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(paginatedDiseases) && paginatedDiseases.length > 0 ? (
            paginatedDiseases.map((disease) => (
              <button
                key={disease._id}
                onClick={() => setSelectedDisease(disease)}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {disease.image && (
                  <img
                    src={disease.image}
                    alt={disease.name}
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{disease.name}</h3>

                  <div className="mt-3">
                    <SeverityBadge severity={disease.severity} />
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {Array.isArray(disease.symptoms) ? disease.symptoms.join(", ") : ""}
                  </p>

                  <div className="mt-4 inline-flex whitespace-nowrap text-sm font-medium text-blue-700">Xem chi tiết</div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              Không tìm thấy bệnh phù hợp
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`rounded px-4 py-2 text-sm ${
                currentPage === index + 1 ? "bg-blue-600 text-white" : "border"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {selectedDisease && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 px-3 py-4 sm:px-6 sm:py-8">
          <div className="mx-auto flex h-full max-w-4xl items-center justify-center">
            <div className="max-h-full w-full overflow-y-auto rounded-3xl bg-white shadow-xl">
              <div className="relative overflow-hidden border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
                <button
                  onClick={() => {
                    setSelectedDisease(null);
                    resetFeedbackState();
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("id");
                      return next;
                    });
                  }}
                  className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Đóng
                </button>

                <div className="pr-20">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      Bệnh lý
                    </span>
                    <SeverityBadge severity={selectedDisease.severity} />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {selectedDisease.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Mức độ hiện tại:{" "}
                    <span className="font-semibold text-slate-800">
                      {getSeverityLabel(selectedDisease.severity)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {selectedDisease.image && (
                  <img
                    src={selectedDisease.image}
                    alt={selectedDisease.name}
                    loading="lazy"
                    decoding="async"
                    className="mb-6 h-56 w-full rounded-2xl object-cover sm:h-72"
                  />
                )}

                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">Thông tin chi tiết</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Xem nhanh mô tả, triệu chứng và hướng xử trí liên quan.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowFeedbackForm((prev) => !prev);
                      setFeedbackMessage("");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700"
                  >
                    <Flag size={16} />
                    Góp ý nội dung
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {detailSections.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
                      Nếu bạn thấy thông tin chưa chính xác, hãy gửi mô tả ngắn gọn để bổ sung.
                    </p>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={feedbackTitle}
                  onChange={(event) => setFeedbackTitle(event.target.value)}
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
                <textarea
                  placeholder="Nội dung góp ý"
                  value={feedbackContent}
                  onChange={(event) => setFeedbackContent(event.target.value)}
                  maxLength={CONTENT_FEEDBACK_MAX_LENGTH}
                  className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
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
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={feedbackLoading}
                    className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white disabled:bg-amber-300"
                  >
                    {feedbackLoading ? "Đang gửi..." : "Gửi góp ý"}
                  </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
