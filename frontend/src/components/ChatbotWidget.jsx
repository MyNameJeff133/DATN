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
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div
          ref={boxRef}
          className={`fixed bottom-5 right-5 z-50 w-[calc(100vw-24px)] max-w-[380px] overflow-hidden rounded-xl border bg-white shadow-xl ${
            minimized ? "h-16" : "h-[620px] max-h-[calc(100vh-40px)]"
          }`}
        >
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Chatbot sức khỏe</p>
              <p className="text-xs text-blue-100">Tra cứu nhanh thông tin cơ bản</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setMinimized(!minimized)}>
                <Minus size={16} />
              </button>
              <button onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimized && (
            <div className="h-[calc(100%-60px)] p-3">
              <Chatbot />
            </div>
          )}
        </div>
      )}
    </>
  );
}
