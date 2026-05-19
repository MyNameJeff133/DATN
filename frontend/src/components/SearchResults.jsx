import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import normalizeText from "../utils/normalizeText";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [diseases, setDiseases] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/search", {
          params: { q: normalizeText(q) },
        });

        setDiseases(res.data.diseases || res.data.items || []);
        setDrugs(res.data.drugs || res.data.items || []);
      } catch (err) {
        setDiseases([]);
        setDrugs([]);
        setError(err.response?.data?.message || "Không thể tải kết quả tìm kiếm lúc này.");
      } finally {
        setLoading(false);
      }
    };

    if (q.trim()) {
      fetchResults();
    } else {
      setDiseases([]);
      setDrugs([]);
      setError("");
      setLoading(false);
    }
  }, [q]);

  const hasResults = diseases.length > 0 || drugs.length > 0;

  return (
    <div className="up-page">
      <div className="up-section mb-8 px-5 py-7 sm:px-7">
        <span className="up-kicker">Tìm kiếm</span>
        <h2 className="up-title mt-3">Kết quả tìm kiếm: "{q}"</h2>
      </div>

      {loading && (
        <div className="up-panel p-10 text-center text-slate-500">
          Đang tải kết quả tìm kiếm...
        </div>
      )}

      {!loading && error && (
        <div className="up-panel border-red-200 bg-red-50 p-10 text-center text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && diseases.length > 0 && (
        <ResultSection title="Bệnh">
          {diseases.map((disease) => (
            <Link
              key={disease._id}
              to={`/diseases?id=${disease._id}`}
              className="up-card overflow-hidden"
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
                <h3 className="text-xl font-bold text-slate-950">{disease.name}</h3>
                <div className="mt-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      disease.severity === "low"
                        ? "bg-green-100 text-green-700"
                        : disease.severity === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {disease.severity}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {Array.isArray(disease.symptoms) ? disease.symptoms.join(", ") : ""}
                </p>
              </div>
            </Link>
          ))}
        </ResultSection>
      )}

      {!loading && !error && drugs.length > 0 && (
        <ResultSection title="Thuốc" className="mt-10">
          {drugs.map((drug) => (
            <Link key={drug._id} to={`/drugs?id=${drug._id}`} className="up-card p-5">
              <h3 className="text-lg font-bold text-slate-950">{drug.name}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {drug.usage || "Chưa có mô tả"}
              </p>
            </Link>
          ))}
        </ResultSection>
      )}

      {!loading && !error && !hasResults && (
        <div className="up-panel p-10 text-center text-slate-500">
          Không tìm thấy kết quả phù hợp
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, className = "", children }) {
  return (
    <section className={className}>
      <h3 className="mb-4 text-xl font-bold text-slate-950">{title}</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
