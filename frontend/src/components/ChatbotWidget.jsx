import { useEffect, useRef, useState } from "react";
import { MessageCircle, Minus, X } from "lucide-react";
import Chatbot from "../pages/Chatbot";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const boxRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setMinimized(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!visible) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
          }}
          aria-label="Mở chatbot"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/25 transition hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div
          ref={boxRef}
          className={`fixed bottom-5 right-5 z-50 w-[calc(100vw-24px)] max-w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-950 dark:shadow-black/40 ${
            minimized ? "h-16" : "h-[620px] max-h-[calc(100vh-40px)]"
          }`}
        >
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white dark:bg-cyan-700">
            <div>
              <p className="font-semibold">Chatbot sức khỏe</p>
              <p className="text-xs text-blue-100">Tra cứu nhanh thông tin cơ bản</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMinimized(!minimized)}
                aria-label={minimized ? "Mở rộng chatbot" : "Thu gọn chatbot"}
                className="rounded-lg p-1 transition hover:bg-white/15"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng chatbot"
                className="rounded-lg p-1 transition hover:bg-white/15"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="h-[calc(100%-60px)] bg-slate-50 p-3 dark:bg-slate-950">
              <Chatbot compact />
            </div>
          )}
        </div>
      )}
    </>
  );
}
