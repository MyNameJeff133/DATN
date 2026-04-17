import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  diseaseCategoryOptions,
  getCategoryLabel,
  severityOptions,
} from "../constants/medicalData";
import SeverityBadge from "../pages/SeverityBadge";
import api from "../services/api";

const emptyForm = {
  name: "",
  category: "khac",
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
  const [selectedLetter, setSelectedLetter] = useState("");

  const isAdmin = user?.role === "admin";

  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );

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
    try {
      const res = await api.get("/diseases");
      setDiseases(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const openAddModal = () => {
    if (!isAdmin) return;
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEdit = (disease) => {
    if (!isAdmin) return;
    setEditingId(disease._id);
    setFormData({
      name: disease.name || "",
      category: disease.category || "khac",
      symptoms: Array.isArray(disease.symptoms)
        ? disease.symptoms.join(", ")
        : "",
      causes: disease.causes || "",
      treatment: disease.treatment || "",
      prevention: disease.prevention || "",
      severity: disease.severity || "low",
      description: disease.description || "",
      image: disease.image || "",
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const payload = {
      ...formData,
      symptoms: formData.symptoms
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await api.put(`/diseases/${editingId}`, payload);
      } else {
        await api.post("/diseases", payload);
      }

      setShowModal(false);
      setFormData(emptyForm);
      fetchDiseases();
    } catch (error) {
      console.error(error);
      alert("Co loi xay ra khi luu benh.");
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Xoa benh nay?")) return;

    try {
      await api.delete(`/diseases/${id}`);
      fetchDiseases();
    } catch (error) {
      console.error(error);
      alert("Khong the xoa benh.");
    }
  };

  const normalize = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const filteredDiseases = diseases.filter((disease) => {
    const name = disease.name || "";

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || disease.category === filterCategory;

    const matchesAlphabet =
      !selectedLetter || normalize(name).startsWith(selectedLetter);

    return matchesSearch && matchesCategory && matchesAlphabet;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quan ly benh ly</h1>
        <p className="mt-2 text-gray-600">
          {isAdmin
            ? "Them, sua va dong bo du lieu benh voi trang tra cuu."
            : "Kiem duyet vien chi co quyen xem du lieu benh."}
        </p>
      </div>

      {!isAdmin && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Ban dang o che do chi xem. Chi admin moi duoc them, sua va xoa benh.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Tim kiem ten benh..."
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
            <option value="all">Tat ca nhom benh</option>
            {diseaseCategoryOptions.map((option) => (
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
              Them benh
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedLetter("")}
          className={`rounded-lg border px-3 py-2 text-sm ${
            selectedLetter === "" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          All
        </button>

        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              selectedLetter === letter
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDiseases.map((disease) => (
          <div
            key={disease._id}
            className="overflow-hidden rounded-xl bg-white shadow-sm"
          >
            {disease.image && (
              <img
                src={disease.image}
                alt={disease.name}
                className="h-44 w-full object-cover"
              />
            )}

            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                {disease.name}
              </h3>

              <p className="mt-1 text-sm text-blue-600">
                {getCategoryLabel(diseaseCategoryOptions, disease.category)}
              </p>

              <div className="mt-3">
                <SeverityBadge severity={disease.severity} />
              </div>

              {disease.description && (
                <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                  {disease.description}
                </p>
              )}

              <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                {Array.isArray(disease.symptoms)
                  ? disease.symptoms.join(", ")
                  : ""}
              </p>

              {disease.image && (
                <a
                  href={disease.image}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-xs text-blue-600 underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Xem link anh
                </a>
              )}

              {isAdmin && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(disease)}
                    className="rounded bg-yellow-500 px-3 py-1.5 text-xs text-white hover:bg-yellow-600"
                  >
                    Sua
                  </button>
                  <button
                    onClick={() => handleDelete(disease._id)}
                    className="rounded bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                  >
                    Xoa
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900">
              {editingId ? "Cap nhat benh" : "Them benh"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <input
                name="name"
                placeholder="Ten benh"
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
                {diseaseCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm"
              >
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                name="image"
                placeholder="Link hinh anh"
                value={formData.image}
                onChange={handleChange}
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              {formData.image && (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 md:col-span-2">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Xem truoc anh
                  </p>
                  <img
                    src={formData.image}
                    alt={formData.name || "Disease preview"}
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <a
                    href={formData.image}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm text-blue-600 underline"
                  >
                    Mo link anh
                  </a>
                </div>
              )}

              <textarea
                name="description"
                placeholder="Mo ta"
                value={formData.description}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <textarea
                name="symptoms"
                placeholder="Trieu chung, cach nhau boi dau phay"
                value={formData.symptoms}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
              />

              <textarea
                name="causes"
                placeholder="Nguyen nhan"
                value={formData.causes}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />

              <textarea
                name="treatment"
                placeholder="Dieu tri"
                value={formData.treatment}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm"
              />

              <textarea
                name="prevention"
                placeholder="Phong ngua"
                value={formData.prevention}
                onChange={handleChange}
                className="min-h-28 rounded-lg border border-gray-300 px-4 py-3 text-sm md:col-span-2"
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
                  {editingId ? "Cap nhat" : "Them"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
