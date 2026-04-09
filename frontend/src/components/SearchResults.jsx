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
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="mb-6 text-3xl font-bold text-gray-900">
        Ket qua tim kiem: "{q}"
      </h2>

      {diseases.length > 0 && (
        <>
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Benh</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {diseases.map((disease) => (
              <div key={disease._id} className="rounded-xl bg-white shadow-sm">
                {disease.image && (
                  <img
                    src={disease.image}
                    alt={disease.name}
                    className="h-44 w-full rounded-t-xl object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900">{disease.name}</h3>
                  <div className="mt-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
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
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {disease.symptoms.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {drugs.length > 0 && (
        <>
          <h3 className="mb-4 mt-10 text-xl font-semibold text-gray-900">Thuoc</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drugs.map((drug) => (
              <div key={drug._id} className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{drug.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                  {drug.usage || "Chua co mo ta"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {diseases.length === 0 && drugs.length === 0 && (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Khong tim thay ket qua phu hop
        </div>
      )}
    </div>
  );
}
