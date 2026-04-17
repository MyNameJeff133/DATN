import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { drugCategoryOptions, getCategoryLabel } from "../constants/medicalData";
import api from "../services/api";

const emptyForm = {
  name: "",
  category: "khac",
  image: "",
  usage: "",
  dosage: "",
  sideEffects: "",
  contraindications: "",
};

const toCommaSeparatedText = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value || "";
};

export default function AdminDrugs() {
  const [drugs, setDrugs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [role, setRole] = useState("");

  const isAdmin = role === "admin";

  const fetchDrugs = async () => {
    try {
      const res = await api.get("/drugs");
      setDrugs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setRole(jwtDecode(token).role || "");
      } catch {
        setRole("");
      }
    }
    fetchDrugs();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "image" ? value.trim() : value,
    }));

    if (name === "image") {
      setImagePreviewError(false);
    }
  };

  const openAddModal = () => {
    if (!isAdmin) return;
    setEditingDrug(null);
    setFormData(emptyForm);
    setImagePreviewError(false);
    setShowModal(true);
  };

  const handleEdit = (drug) => {
    if (!isAdmin) return;
    setEditingDrug(drug);
    setFormData({
      name: drug.name || "",
      category: drug.category || "khac",
      image: drug.image || "",
      usage: drug.usage || "",
      dosage: drug.dosage || "",
      sideEffects: toCommaSeparatedText(drug.sideEffects),
      contraindications: toCommaSeparatedText(drug.contraindications),
    });
    setImagePreviewError(false);
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const dataToSend = {
      ...formData,
      sideEffects: formData.sideEffects
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      contraindications: formData.contraindications
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingDrug) {
        await api.put(`/drugs/${editingDrug._id}`, dataToSend);
      } else {
        await api.post("/drugs", dataToSend);
      }

      setShowModal(false);
      setFormData(emptyForm);
      setImagePreviewError(false);
      fetchDrugs();
    } catch (error) {
      console.error("Drug submit error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu thuốc.");
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Xóa thuốc này?")) return;

    try {
      await api.delete(`/drugs/${id}`);
      fetchDrugs();
    } catch (error) {
      console.error(error);
      alert("Không thể xóa thuốc.");
    }
  };

  const filteredDrugs = drugs.filter((drug) => {
    const matchSearch = drug.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "all" || drug.category === filterCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quan ly thuoc</h1>
        <p className="mt-2 text-gray-600">
          {isAdmin
            ? "Thêm, sửa và kiểm tra hình ảnh thuốc như trang bệnh."
            : "Kiểm duyệt viên chỉ có quyền xem dữ liệu thuốc."}
        </p>
      </div>

      {!isAdmin && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Bạn đang ở chế độ chỉ xem. Chỉ admin mới được thêm, sửa và xóa thuốc.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Tìm kiếm tên thuốc..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm md:max-w-md"
        />

        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {drugCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={openAddModal}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm text-white hover:bg-blue-700"
            >
              Thêm thuốc
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDrugs.map((drug) => (
          <div
            key={drug._id}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            {drug.image && (
              <img
                src={drug.image}
                alt={drug.name}
                className="h-44 w-full object-cover"
              />
            )}

            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                {drug.name}
              </h3>

              <p className="mt-1 text-sm text-blue-600">
                {getCategoryLabel(drugCategoryOptions, drug.category)}
              </p>

              {drug.usage && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                  {drug.usage}
                </p>
              )}

              <p className="mt-3 text-sm text-gray-600">
                <strong>Liều dùng:</strong> {drug.dosage || "-"}
              </p>

              {drug.image && (
                <a
                  href={drug.image}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-xs text-blue-600 underline"
                >
                  Xem link ảnh
                </a>
              )}

              {!drug.image && (
                <p className="mt-4 text-xs text-gray-400">Chưa có ảnh</p>
              )}

              {isAdmin && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(drug)}
                    className="rounded bg-yellow-500 px-3 py-1.5 text-xs text-white hover:bg-yellow-600"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(drug._id)}
                    className="rounded bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900">
              {editingDrug ? "Cap nhat thuoc" : "Them thuoc"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                name="name"
                placeholder="Tên thuốc"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm"
              >
                {drugCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                name="dosage"
                placeholder="Liều dùng"
                value={formData.dosage}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />

              <input
                name="image"
                type="url"
                placeholder="Link hình ảnh"
                value={formData.image}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              {formData.image && (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Xem trước ảnh
                  </p>

                  {!imagePreviewError ? (
                    <img
                      src={formData.image}
                      alt={formData.name || "Drug preview"}
                      className="h-48 w-full rounded-lg object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-lg bg-gray-100 text-center text-sm text-gray-500">
                      Không preview được ảnh từ link này.
                    </div>
                  )}

                  <a
                    href={formData.image}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm text-blue-600 underline"
                  >
                    Mở link ảnh
                  </a>

                  <p className="mt-2 break-all text-xs text-gray-500">
                    {formData.image}
                  </p>
                </div>
              )}

              <textarea
                name="usage"
                placeholder="Công dụng"
                value={formData.usage}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <textarea
                name="contraindications"
                placeholder="Chống chỉ định, cách nhau bằng dấu phẩy"
                value={formData.contraindications}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <textarea
                name="sideEffects"
                placeholder="Tác dụng phụ, cách nhau bằng dấu phẩy"
                value={formData.sideEffects}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
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
                  {editingDrug ? "Cập nhật" : "Thêm thuốc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
