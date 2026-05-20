import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Pill,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import api from "../services/api";
import { getStoredToken } from "../services/authStorage";

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

export default function Chatbot({ compact = false }) {
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
    const token = getStoredToken();
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

  const sendMessage = async () => {
    const content = input.trim();
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
      {!compact && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-lg bg-blue-600 p-3 text-white shadow-sm shadow-blue-900/20 dark:bg-cyan-600">
                <Bot size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-950 dark:text-slate-50">
                  Chatbot sức khỏe
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Tra cứu nhanh một số thông tin bệnh và thuốc.
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{historyNote}</p>
              </div>
            </div>

            <button
              onClick={clearConversation}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw size={12} />
              Xóa chat
            </button>
          </div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">{historyNote}</p>
          <button
            onClick={clearConversation}
            disabled={loading}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw size={12} />
            Xóa
          </button>
        </div>
      )}

      <div className={`${compact ? "px-3 py-4" : "px-4 py-5"} flex-1 space-y-4 overflow-y-auto bg-slate-50 dark:bg-slate-950`}>
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
                <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-900/20 dark:bg-cyan-600">
                  <Stethoscope size={14} />
                </div>
              )}

              <div
                className={`max-w-[min(88%,42rem)] rounded-xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  isUser
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                }`}
              >
                <div
                  className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase ${
                    isUser ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
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
            <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-900/20 dark:bg-cyan-600">
              <Pill size={14} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <div className="mb-2 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
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

      <div className={`${compact ? "p-3" : "p-4"} border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950`}>
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-cyan-500 dark:focus-within:bg-slate-900 dark:focus-within:ring-cyan-950">
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
              className="max-h-32 w-full resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
