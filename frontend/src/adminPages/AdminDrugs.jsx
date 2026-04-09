import { useEffect, useState } from "react";
import api from "../services/api";

const categoryMap = {
  khang_sinh: "Kháng sinh",
  giam_dau: "Giảm đau",
  ha_sot: "Hạ sốt",
  tim_mach: "Tim mạch",
  noi_tiet: "Nội tiết",
  tieu_hoa: "Tiêu hóa",
  than_kinh: "Thần kinh",
  co_xuong_khop: "Cơ xương khớp",
  da_lieu: "Da liệu",
  khac: "Khác",
};

const emptyForm = {
  name: "",
  category: "khác",
  usage: "",
  dosage: "",
  sideEffects: "",
  contraindications: "",
};

export default function AdminDrugs() {
  const [drugs, setDrugs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchDrugs = async () => {
    const res = await api.get("/drugs");
    setDrugs(res.data);
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingDrug(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (drug) => {
    setEditingDrug(drug);
    setFormData({
      ...drug,
      sideEffects: drug.sideEffects,
      contraindications: drug.contraindications,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      sideEffects: formData.sideEffects,
      contraindications: formData.contraindications,
    };

    if (editingDrug) {
      await api.put(`/drugs/${editingDrug._id}`, dataToSend);
    } else {
      await api.post("/drugs", dataToSend);
    }

    setShowModal(false);
    fetchDrugs();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa thuốc này?")) {
      await api.delete(`/drugs/${id}`);
      fetchDrugs();
    }
  };

  const filteredDrugs = drugs.filter((drug) => {
    const matchSearch = drug.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "all" || drug.category === filterCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý thuốc</h1>
        <p className="mt-2 text-gray-600">Quản lý danh mục thuốc trong hệ thống.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Tìm kiếm tên thuốc..."
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
            <option value="all">Tat ca danh muc</option>
            {Object.entries(categoryMap).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Thêm thuốc
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Ten</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Danh muc</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Lieu dung</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Cong dung</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Hanh dong</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrugs.map((drug) => (
              <tr key={drug._id} className="border-t">
                <td className="px-4 py-3">{drug.name}</td>
                <td className="px-4 py-3">{categoryMap[drug.category]}</td>
                <td className="px-4 py-3">{drug.dosage}</td>
                <td className="px-4 py-3">{drug.usage}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(drug)}
                      className="rounded bg-yellow-400 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(drug._id)}
                      className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Xóa  
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900">
              {editingDrug ? "Cap nhat thuoc" : "Them thuoc"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                name="name"
                placeholder="Ten thuoc"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
              >
                {Object.entries(categoryMap).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              <input
                name="dosage"
                placeholder="Lieu dung"
                value={formData.dosage}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none"
              />
              <input
                name="usage"
                placeholder="Cong dung"
                value={formData.usage}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />
              <input
                name="contraindications"
                placeholder="Chong chi dinh"
                value={formData.contraindications}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />
              <input
                name="sideEffects"
                placeholder="Tac dung phu"
                value={formData.sideEffects}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none md:col-span-2"
              />

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600"
                >
                  Huy
                </button>
                <button className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white">
                  {editingDrug ? "Cap nhat" : "Them"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
