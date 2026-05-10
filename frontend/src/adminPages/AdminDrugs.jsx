import { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "react-router-dom";
import { drugCategoryOptions, getCategoryLabel } from "../constants/medicalData";
import api from "../services/api";
import { getStoredToken } from "../services/authStorage";

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
  const [selectedLetter, setSelectedLetter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDrug, setEditingDrug] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [role, setRole] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = role === "admin";
  const canEdit = role === "admin" || role === "moderator";
  const alphabet = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

  const fetchDrugs = async () => {
    try {
      const res = await api.get("/drugs");
      setDrugs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      try {
        setRole(jwtDecode(token).role || "");
      } catch {
        setRole("");
      }
    }
    fetchDrugs();
  }, []);

  const clearEditQuery = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("edit");
      return next;
    });
  };

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

  const handleEdit = useCallback((drug) => {
    if (!canEdit) return;

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
  }, [canEdit]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || drugs.length === 0 || !canEdit) {
      return;
    }

    const found = drugs.find((drug) => drug._id === editId);
    if (found) {
      handleEdit(found);
    }
  }, [searchParams, drugs, canEdit, handleEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canEdit) return;

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
      setEditingDrug(null);
      clearEditQuery();
      fetchDrugs();
    } catch (error) {
      console.error("Drug submit error:", error);
      alert(error.response?.data?.message || "Co loi xay ra khi luu thuoc.");
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

  const normalize = (value) =>
    value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  const filteredDrugs = drugs.filter((drug) => {
    const name = drug.name || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || drug.category === filterCategory;
    const matchAlphabet = !selectedLetter || normalize(name).startsWith(selectedLetter);

    return matchSearch && matchCategory && matchAlphabet;
  });

  return (
    <div>
      <div className="mb-6">
        <span className="up-kicker">Admin</span>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Quản lý thuốc</h1>
        <p className="mt-2 text-slate-600">
          {isAdmin
            ? "Thêm, sửa và kiểm tra hình ảnh thuốc như trang bệnh."
            : "Kiểm duyệt viên có thể sửa thuốc hiện có để xử lý góp ý, nhưng không được thêm hay xóa."}
        </p>
      </div>

      {!isAdmin && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Ban co the sua thuoc hien co khi can xu ly gop y. Chi admin moi duoc them va xoa thuoc.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Tim kiem ten thuoc..."
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
            <option value="all">Tat ca danh muc</option>
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

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedLetter("")}
          className={`rounded-lg border px-3 py-2 text-sm ${
            selectedLetter === "" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          All
        </button>

        {alphabet.map((letter) => (
          <button
            type="button"
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              selectedLetter === letter ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDrugs.map((drug) => (
          <div key={drug._id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            {drug.image && (
              <img src={drug.image} alt={drug.name} className="h-44 w-full object-cover" />
            )}

            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900">{drug.name}</h3>

              <p className="mt-1 text-sm text-blue-600">
                {getCategoryLabel(drugCategoryOptions, drug.category)}
              </p>

              {drug.usage && <p className="mt-3 line-clamp-2 text-sm text-gray-600">{drug.usage}</p>}

              <p className="mt-3 text-sm text-gray-600">
                <strong>Lieu dung:</strong> {drug.dosage || "-"}
              </p>

              {drug.image ? (
                <a
                  href={drug.image}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-xs text-blue-600 underline"
                >
                  Xem link anh
                </a>
              ) : (
                <p className="mt-4 text-xs text-gray-400">Chua co anh</p>
              )}

              {canEdit && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(drug)}
                    className="rounded bg-yellow-500 px-3 py-1.5 text-xs text-white hover:bg-yellow-600"
                  >
                    Sửa
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(drug._id)}
                      className="rounded bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900">
              {editingDrug ? "Cập nhật thuốc" : "Thêm thuốc"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                name="name"
                placeholder="Ten thuoc"
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
                placeholder="Lieu dung"
                value={formData.dosage}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />

              <input
                name="image"
                type="url"
                placeholder="Link hinh anh"
                value={formData.image}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              {formData.image && (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-gray-700">Xem truoc anh</p>

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
                    Mo link anh
                  </a>

                  <p className="mt-2 break-all text-xs text-gray-500">{formData.image}</p>
                </div>
              )}

              <textarea
                name="usage"
                placeholder="Cong dung"
                value={formData.usage}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <textarea
                name="contraindications"
                placeholder="Chong chi dinh, cach nhau bang dau phay"
                value={formData.contraindications}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <textarea
                name="sideEffects"
                placeholder="Tac dung phu, cach nhau bang dau phay"
                value={formData.sideEffects}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDrug(null);
                    clearEditQuery();
                  }}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600"
                >
                  Huy
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
