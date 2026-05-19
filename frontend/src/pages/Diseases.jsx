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
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const itemsPerPage = 12;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/diseases");
        setDiseases(res.data || []);
      } catch (err) {
        setDiseases([]);
        setError(err.response?.data?.message || "Không thể tải danh sách bệnh lúc này.");
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");

    if (id && diseases.length > 0) {
      const found = diseases.find((disease) => disease._id === id);
      if (found) setSelectedDisease(found);
    }
  }, [searchParams, diseases]);

  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch = disease.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup ? disease.category === selectedGroup : true;

    return matchesSearch && matchesGroup;
  });

  const totalPages = Math.ceil(filteredDiseases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDiseases = filteredDiseases.slice(startIndex, startIndex + itemsPerPage);
  const detailSections = [
    selectedDisease?.description && {
      title: "Mo ta",
      content: selectedDisease.description,
    },
    {
      title: "Trieu chung",
      content: Array.isArray(selectedDisease?.symptoms)
        ? selectedDisease.symptoms.join(", ")
        : "",
    },
    selectedDisease?.causes && {
      title: "Nguyen nhan",
      content: selectedDisease.causes,
    },
    selectedDisease?.treatment && {
      title: "Dieu tri",
      content: selectedDisease.treatment,
    },
    selectedDisease?.prevention && {
      title: "Phong ngua",
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
      setFeedbackMessage(error.response?.data?.message || "Khong the gui gop y luc nay.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Tra cuu benh
          </span>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Tim thong tin benh de hieu hon</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
            Chon benh de xem nhanh muc do, trieu chung, nguyen nhan va huong phong ngua.
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
        <input
          type="text"
          placeholder="Tim theo ten benh..."
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
          <option value="">Tat ca nhom benh</option>
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
          {paginatedDiseases.length > 0 ? (
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

                  <div className="mt-4 text-sm font-medium text-blue-700">Xem chi tiet</div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              Khong tim thay benh phu hop
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
            Truoc
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
                  }}
                  className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-500 hover:bg-slate-50"
                >
                  Dong
                </button>

                <div className="pr-20">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      Benh ly
                    </span>
                    <SeverityBadge severity={selectedDisease.severity} />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                    {selectedDisease.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Muc do hien tai:{" "}
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
                    <h4 className="text-base font-semibold text-slate-900">Thong tin chi tiet</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Xem nhanh mo ta, trieu chung va huong xu tri lien quan.
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
                    Gop y noi dung
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
                    <h4 className="text-lg font-semibold text-slate-900">Gui gop y cho noi dung nay</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Neu ban thay thong tin chua chinh xac, hay gui mo ta ngan gon de bo sung.
                    </p>
                <input
                  type="text"
                  placeholder="Tieu de"
                  value={feedbackTitle}
                  onChange={(event) => setFeedbackTitle(event.target.value)}
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
                <textarea
                  placeholder="Noi dung gop y"
                  value={feedbackContent}
                  onChange={(event) => setFeedbackContent(event.target.value)}
                  maxLength={CONTENT_FEEDBACK_MAX_LENGTH}
                  className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
                    <div className="mt-2 text-right text-xs text-slate-500">
                      {feedbackContent.length}/{CONTENT_FEEDBACK_MAX_LENGTH} ky tu
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
                    Huy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={feedbackLoading}
                    className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white disabled:bg-amber-300"
                  >
                    {feedbackLoading ? "Dang gui..." : "Gui gop y"}
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
