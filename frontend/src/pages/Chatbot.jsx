import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Pill,
  SendHorizontal,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import api from "../services/api";

const starterPrompts = [
  "Tôi bị sốt và đau họng",
  "Thuốc paracetamol dùng để làm gì?",
  "Ho kéo dài có thể liên quan đến bệnh gì?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Xin chào. Tôi có thể hỗ trợ tìm thông tin bệnh và thuốc thông dụng. Bạn có thể mô tả triệu chứng hoặc nhập tên thuốc.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const pushUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        sender: "user",
        text,
      },
    ]);
  };

  const pushBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-bot`,
        sender: "bot",
        text,
      },
    ]);
  };

  const sendMessage = async (presetMessage) => {
    const content = (presetMessage ?? input).trim();
    if (!content || loading) return;

    pushUserMessage(content);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot", { message: content });
      pushBotMessage(res.data.reply);
    } catch (error) {
      pushBotMessage(
        error.response?.data?.error ||
          "Có lỗi xảy ra khi kết nối đến máy chủ. Bạn thử lại sau nhé."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-600 p-3 text-white">
              <Bot size={20} />
            </div>

            <div>
              <p className="text-base font-semibold text-gray-900">Chatbot sức khỏe</p>
              <p className="mt-1 text-sm text-gray-500">
                Tra cứu nhanh một số thông tin bệnh và thuốc.
              </p>
            </div>
          </div>

          <div className="hidden rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 md:block">
            online
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {starterPrompts.map((prompt, index) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="rounded-lg border bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase text-gray-400">
                  gợi ý 0{index + 1}
                </span>
                <ArrowUpRight size={12} className="text-gray-400" />
              </div>
              <p className="mt-1 text-xs text-gray-700">{prompt}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-5">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Stethoscope size={14} />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-6 ${
                  isUser ? "bg-blue-600 text-white" : "border bg-white text-gray-700"
                }`}
              >
                <div
                  className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase ${
                    isUser ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {isUser ? (
                    <>
                      <Sparkles size={12} />
                      bạn
                    </>
                  ) : (
                    <>
                      <Pill size={12} />
                      trợ lý
                    </>
                  )}
                </div>

                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <Pill size={14} />
            </div>

            <div className="rounded-xl border bg-white px-4 py-3 text-sm text-gray-500">
              <div className="mb-2 text-[11px] font-semibold uppercase text-gray-400">
                đang phân tích
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-lg border bg-gray-50 px-3 py-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Nhập triệu chứng, tên bệnh hoặc tên thuốc..."
              className="max-h-32 w-full resize-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
