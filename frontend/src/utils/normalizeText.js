export default function normalizeText(input) {
  if (input === null || input === undefined) return "";
  const s = String(input).replace(/đ/g, "d").replace(/Đ/g, "D");
  // Normalize and remove combining diacritics (marks)
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}