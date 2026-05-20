const VIETNAMESE_CHAR_GROUPS = {
  a: "aàáảãạăằắẳẵặâầấẩẫậ",
  d: "dđ",
  e: "eèéẻẽẹêềếểễệ",
  i: "iìíỉĩị",
  o: "oòóỏõọôồốổỗộơờớởỡợ",
  u: "uùúủũụưừứửữự",
  y: "yỳýỷỹỵ",
};

const escapeRegexChar = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toCharClass = (characters) => {
  const variants = Array.from(new Set([...characters, ...characters.toUpperCase()]));
  return `[${variants.map(escapeRegexChar).join("")}]`;
};

const VIETNAMESE_CHAR_CLASSES = Object.fromEntries(
  Object.entries(VIETNAMESE_CHAR_GROUPS).map(([key, value]) => [key, toCharClass(value)]),
);

export const normalizeSearchText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export const createVietnameseSearchRegex = (value) => {
  const normalizedValue = normalizeSearchText(value);

  const pattern = Array.from(normalizedValue)
    .map((character) => {
      if (/\s/.test(character)) {
        return "\\s+";
      }

      return VIETNAMESE_CHAR_CLASSES[character] || escapeRegexChar(character);
    })
    .join("");

  return new RegExp(pattern, "i");
};
