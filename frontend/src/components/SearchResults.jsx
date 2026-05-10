import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");
  const [diseases, setDiseases] = useState([]);
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await api.get(`/search?q=${q}`);
      setDiseases(res.data.diseases);
      setDrugs(res.data.drugs);
    };

    if (q) fetchResults();
  }, [q]);

  return (
    <div className="up-page">
      <div className="up-section mb-8 px-5 py-7 sm:px-7">
        <span className="up-kicker">Tìm kiếm</span>
        <h2 className="up-title mt-3">Kết quả tìm kiếm: "{q}"</h2>
      </div>

      {diseases.length > 0 && (
        <ResultSection title="Bệnh">
          {diseases.map((disease) => (
            <div key={disease._id} className="up-card overflow-hidden">
              {disease.image && (
                <img src={disease.image} alt={disease.name} className="h-44 w-full object-cover" />
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
            </div>
          ))}
        </ResultSection>
      )}

      {drugs.length > 0 && (
        <ResultSection title="Thuốc" className="mt-10">
          {drugs.map((drug) => (
            <div key={drug._id} className="up-card p-5">
              <h3 className="text-lg font-bold text-slate-950">{drug.name}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {drug.usage || "Chưa có mô tả"}
              </p>
            </div>
          ))}
        </ResultSection>
      )}

      {diseases.length === 0 && drugs.length === 0 && (
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
