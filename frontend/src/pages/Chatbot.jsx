import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Pill,
  RotateCcw,
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

const guestStorageKey = "guest_chatbot_messages";

const defaultMessages = [
  {
    id: "welcome",
    sender: "bot",
    text: "Xin chào. Tôi có thể hỗ trợ tìm thông tin bệnh và thuốc thông dụng. Bạn có thể mô tả triệu chứng hoặc nhập tên thuốc.",
  },
];

const withLocalIds = (messages = []) =>
  messages.map((message, index) => ({
    id:
      message.id ||
      `${message.sender}-${message.createdAt || Date.now()}-${index}`,
    sender: message.sender,
    text: message.text,
    createdAt: message.createdAt,
  }));

export default function Chatbot() {
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [historyNote, setHistoryNote] = useState("");
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = Boolean(token);
    setIsLoggedIn(loggedIn);

    const loadMessages = async () => {
      if (loggedIn) {
        try {
          const res = await api.get("/chatbot/history");
          const historyMessages =
            res.data?.messages?.length > 0
              ? withLocalIds(res.data.messages)
              : defaultMessages;

          setMessages(historyMessages);
          setHistoryNote("Đã đăng nhập: lịch sử chat được lưu trong 3 ngày.");
        } catch (error) {
          console.error("Load chat history error:", error);
          setMessages(defaultMessages);
          setHistoryNote("Không tải được lịch sử chat, đang dùng phiên tạm thời.");
        } finally {
          setInitialized(true);
        }

        return;
      }

      const savedGuestMessages = sessionStorage.getItem(guestStorageKey);

      if (savedGuestMessages) {
        try {
          setMessages(withLocalIds(JSON.parse(savedGuestMessages)));
        } catch {
          setMessages(defaultMessages);
        }
      } else {
        setMessages(defaultMessages);
      }

      setHistoryNote("Khách: lịch sử chat chỉ được giữ trong phiên hiện tại.");
      setInitialized(true);
    };

    loadMessages();
  }, []);

  useEffect(() => {
    if (!initialized || isLoggedIn) return;

    sessionStorage.setItem(
      guestStorageKey,
      JSON.stringify(messages.map(({ sender, text, createdAt }) => ({
        sender,
        text,
        createdAt,
      }))),
    );
  }, [initialized, isLoggedIn, messages]);

  const clearConversation = async () => {
    if (loading) return;

    if (isLoggedIn) {
      try {
        await api.delete("/chatbot/history");
      } catch (error) {
        console.error("Clear chat history error:", error);
      }
    } else {
      sessionStorage.removeItem(guestStorageKey);
    }

    setMessages(defaultMessages);
  };

  const sendMessage = async (presetMessage) => {
    const content = (presetMessage ?? input).trim();
    if (!content || loading || sendingRef.current) return;

    sendingRef.current = true;

    const userMessage = {
      id: `${Date.now()}-user`,
      sender: "user",
      text: content,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot", {
        message: content,
        messages: messages.map(({ sender, text, createdAt }) => ({
          sender,
          text,
          createdAt,
        })),
      });

      const serverMessages =
        res.data?.messages?.length > 0
          ? withLocalIds(res.data.messages)
          : [
              ...nextMessages,
              {
                id: `${Date.now()}-bot`,
                sender: "bot",
                text: res.data.reply,
                createdAt: new Date().toISOString(),
              },
            ];

      setMessages(serverMessages);
    } catch (error) {
      const fallbackReply =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Có lỗi xảy ra khi kết nối đến máy chủ. Bạn thử lại sau nhé.";

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot-error`,
          sender: "bot",
          text: fallbackReply,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
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
              <p className="text-base font-semibold text-gray-900">
                Chatbot sức khỏe
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Tra cứu nhanh một số thông tin bệnh và thuốc.
              </p>
              <p className="mt-1 text-xs text-gray-400">{historyNote}</p>
            </div>
          </div>

          <button
            onClick={clearConversation}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200 disabled:opacity-60"
          >
            <RotateCcw size={12} />
            Xóa chat
          </button>
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
        {messages.map((message) => {
          const isUser = message.sender === "user";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Stethoscope size={14} />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-6 ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "border bg-white text-gray-700"
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

                <p className="whitespace-pre-line">{message.text}</p>
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
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.repeat &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
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
