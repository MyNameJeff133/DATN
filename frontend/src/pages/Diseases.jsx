import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const diseaseGroups = [
  { value: "tim_mach", label: "Tim mạch" },
  { value: "ho_hap", label: "Hô hấp" },
  { value: "noi_tiet_chuyen_hoa", label: "Nội tiết - chuyển hóa" },
  { value: "tieu_hoa", label: "Tiêu hóa" },
  { value: "co_xuong_khop", label: "Cơ xương khớp" },
  { value: "truyen_nhiem", label: "Truyền nhiễm" },
  { value: "ung_thu", label: "Ung thư" },
  { value: "tam_than", label: "Tâm thần - hành vi" },
  { value: "than_kinh", label: "Thần kinh" },
  { value: "da_lieu", label: "Da liệu" },
  { value: "sinh_duc_tiet_nieu", label: "Sinh dục - tiết niệu" },
  { value: "benh_nghe_nghiep", label: "Bệnh nghề nghiệp" },
  { value: "khac", label: "Khác" },
];

export default function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const itemsPerPage = 12;

  useEffect(() => {
    api.get("/diseases").then((res) => setDiseases(res.data));
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");

    if (id && diseases.length > 0) {
      const found = diseases.find((d) => d._id === id);
      if (found) setSelectedDisease(found);
    }
  }, [searchParams, diseases]);

  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch = disease.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesGroup = selectedGroup ? disease.category === selectedGroup : true;

    return matchesSearch && matchesGroup;
  });

  const totalPages = Math.ceil(filteredDiseases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDiseases = filteredDiseases.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Tra cứu bệnh</h2>
        <p className="mt-2 text-gray-600">
          Tìm thông tin bệnh theo tên và nhóm bệnh.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_260px]">
        <input
          type="text"
          placeholder="Tìm theo tên bệnh..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
        />

        <select
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="">Tất cả nhóm bệnh</option>
          {diseaseGroups.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDiseases.length > 0 ? (
          paginatedDiseases.map((disease) => (
            <div
              key={disease._id}
              onClick={() => setSelectedDisease(disease)}
              className="cursor-pointer rounded-xl bg-white shadow-sm transition hover:shadow-md"
            >
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
          ))
        ) : (
          <div className="col-span-full rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
            Không tìm thấy bệnh phù hợp
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

      {selectedDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setSelectedDisease(null)}
              className="float-right text-xl text-gray-500"
            >
              x
            </button>

            <h3 className="mb-4 text-2xl font-bold text-gray-900">
              {selectedDisease.name}
            </h3>

            {selectedDisease.image && (
              <img
                src={selectedDisease.image}
                alt={selectedDisease.name}
                className="mb-4 h-60 w-full rounded-lg object-cover"
              />
            )}

            <p className="mb-2">
              <strong>Muc do:</strong> {selectedDisease.severity}
            </p>
            {selectedDisease.description && (
              <p className="mb-3">
                <strong>Mo ta:</strong> {selectedDisease.description}
              </p>
            )}
            <p className="mb-3">
              <strong>Trieu chung:</strong> {selectedDisease.symptoms.join(", ")}
            </p>
            {selectedDisease.causes && (
              <p className="mb-3">
                <strong>Nguyen nhan:</strong> {selectedDisease.causes}
              </p>
            )}
            {selectedDisease.treatment && (
              <p className="mb-3">
                <strong>Dieu tri:</strong> {selectedDisease.treatment}
              </p>
            )}
            {selectedDisease.prevention && (
              <p className="mb-3">
                <strong>Phong ngua:</strong> {selectedDisease.prevention}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
