import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const drugCategories = [
  { value: "khang_sinh", label: "Kháng sinh" },
  { value: "giam_dau", label: "Giảm đau" },
  { value: "ha_sot", label: "Hạ sốt" },
  { value: "tim_mach", label: "Tim mạch" },
  { value: "noi_tiet", label: "Nội tiết" },
  { value: "tieu_hoa", label: "Tiêu hóa" },
  { value: "than_kinh", label: "Thần kinh" },
  { value: "co_xuong_khop", label: "Cơ xương khớp" },
  { value: "da_lieu", label: "Da liệu" },
  { value: "khac", label: "Khác" },
];

export default function Drugs() {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const itemsPerPage = 12;

  useEffect(() => {
    api.get("/drugs").then((res) => setDrugs(res.data));
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");

    if (id && drugs.length > 0) {
      const found = drugs.find((d) => d._id === id);
      if (found) setSelectedDrug(found);
    }
  }, [searchParams, drugs]);

  const filteredDrugs = drugs.filter((drug) => {
    const matchesSearch = drug.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? drug.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrugs = filteredDrugs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Tra cứu thuốc</h2>
        <p className="mt-2 text-gray-600">Tìm thuốc theo tên và danh mục.</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_260px]">
        <input
          type="text"
          placeholder="Tìm theo tên thuốc..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {drugCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDrugs.length > 0 ? (
          paginatedDrugs.map((drug) => (
            <div
              key={drug._id}
              onClick={() => setSelectedDrug(drug)}
              className="cursor-pointer rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >
              {drug.image && (
                <img
                  src={drug.image}
                  alt={drug.name}
                  className="h-44 w-full rounded-t-xl object-cover"
                />
              )}

              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900">{drug.name}</h3>
                <span className="mt-3 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  {drugCategories.find((c) => c.value === drug.category)?.label || "Khac"}
                </span>
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">{drug.usage}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Không tìm thấy thuốc phù hợp
          </div>
        )}
      </div>

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

      {selectedDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setSelectedDrug(null)}
              className="float-right text-xl text-gray-500"
            >
              x
            </button>

            <h3 className="mb-4 text-2xl font-bold text-gray-900">{selectedDrug.name}</h3>

            {selectedDrug.image && (
              <img
                src={selectedDrug.image}
                alt={selectedDrug.name}
                className="mb-4 h-60 w-full rounded-lg object-cover"
              />
            )}

            <p className="mb-2">
              <strong>Danh muc:</strong> {selectedDrug.category}
            </p>
            <p className="mb-3">
              <strong>Cong dung:</strong> {selectedDrug.usage}
            </p>
            <p className="mb-3">
              <strong>Lieu dung:</strong> {selectedDrug.dosage}
            </p>
            <p className="mb-3">
              <strong>Tac dung phu:</strong> {selectedDrug.sideEffects?.join(", ")}
            </p>
            <p className="mb-3">
              <strong>Chong chi dinh:</strong> {selectedDrug.contraindications?.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
