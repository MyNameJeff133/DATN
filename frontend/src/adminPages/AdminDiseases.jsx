import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const categoryOptions = {
  tim_mach: "Tim mạch",
  ho_hap: "Hô hấp",
  noi_tiet_chuyen_hoa: "Nội tiết - chuyển hóa",
  tieu_hoa: "Tiêu hóa",
  co_xuong_khop: "Cơ xương khớp",
  truyen_nhiem: "Truyền nhiễm",
  ung_thu: "Ung thư",
  tam_than: "Tâm thần",
  than_kinh: "Thần kinh",
  da_lieu: "Da liệu",
  sinh_duc_tiet_nieu: "Sinh dục - tiết niệu",
  khac: "Khác",
};

const emptyForm = {
  name: "",
  category: "khác",
  symptoms: "",
  causes: "",
  treatment: "",
  prevention: "",
  severity: "low",
  description: "",
  image: "",
};

export default function AdminDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const fetchDiseases = async () => {
    const res = await api.get("/diseases");
    setDiseases(res.data);
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (disease) => {
    setEditingId(disease._id);
    setFormData({
      ...disease,
      symptoms: disease.symptoms.join(", "),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      symptoms: formData.symptoms.split(",").map((s) => s.trim()),
    };

    if (editingId) {
      await api.put(`/diseases/${editingId}`, payload);
    } else {
      await api.post("/diseases", payload);
    }

    setShowModal(false);
    fetchDiseases();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xoa benh nay?")) {
      await api.delete(`/diseases/${id}`);
      fetchDiseases();
    }
  };

  const filteredDiseases = diseases.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "all" || d.category === filterCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý bệnh lý</h1>
        <p className="mt-2 text-gray-60">Thêm, sửa và lọc danh sách bệnh.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Tìm kiếm tên bệnh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none md:max-w-md"
        />

        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm"
          >
            <option value="all">Tất cả nhóm bệnh</option>
            {Object.entries(categoryOptions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {user?.role === "admin" && (
            <button
              onClick={openAddModal}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Thêm bệnh
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDiseases.map((disease) => (
          <div key={disease._id} className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">{disease.name}</h3>
            <p className="mt-1 text-sm text-blue-600">
              {categoryOptions[disease.category]}
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {disease.symptoms.join(", ")}
            </p>

            {user?.role === "admin" && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(disease)}
                  className="rounded bg-yellow-400 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(disease._id)}
                  className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900">
              {editingId ? "Cap nhat benh" : "Them benh"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                placeholder="Ten benh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />
              <input
                type="text"
                placeholder="Link hinh anh"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
              >
                {Object.entries(categoryOptions).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
              >
                <option value="low">Nhẹ</option>
                <option value="medium">Trung bình</option>
                <option value="high">Nguy hiểm</option>
              </select>
              <input
                placeholder="Triệu chứng"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />
              <input
                placeholder="Nguyên nhân"
                value={formData.causes}
                onChange={(e) => setFormData({ ...formData, causes: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
              />
              <input
                placeholder="Điều trị"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
              />
              <textarea
                placeholder="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600"
                >
                  Hủy
                </button>
                <button className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white">
                  {editingId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
