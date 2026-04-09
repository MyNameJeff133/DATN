// services/chatbot.service.js
const rules = [
  {
    keywords: ["đau đầu"],
    response: "Bạn nên nghỉ ngơi, tránh căng thẳng và uống đủ nước."
  },
  {
    keywords: ["sốt"],
    response: "Nếu sốt cao trên 38.5°C, bạn nên dùng thuốc hạ sốt."
  }
];

exports.getReply = (message) => {
  const rule = rules.find(r =>
    r.keywords.some(k => message.includes(k))
  );
  return rule ? rule.response : "Bạn nên tham khảo dược sĩ.";
};
