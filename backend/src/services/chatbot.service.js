// Reserved for chatbot domain logic shared across controllers.
// The current implementation lives in chatbot.controller.js because it needs
// request-scoped persistence and database reads for disease/drug matching.
export const normalizeChatText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
