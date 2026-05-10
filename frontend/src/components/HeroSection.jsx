import { motion } from "framer-motion";
import { ArrowRight, Bot, HeartPulse, Pill, Search, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  { icon: <HeartPulse size={16} />, label: "Bệnh lý phổ biến" },
  { icon: <Pill size={16} />, label: "Thuốc tham khảo" },
  { icon: <UsersRound size={16} />, label: "Cộng đồng hỏi đáp" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <img
          src="/doctorbg.jpg"
          alt="Bác sĩ tư vấn sức khỏe"
          className="h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,41,92,0.92)_0%,rgba(26,95,138,0.82)_42%,rgba(37,99,235,0.46)_72%,rgba(255,255,255,0.08)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[76vh] max-w-6xl flex-col justify-center px-6 py-14 md:px-8 lg:min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="max-w-2xl text-white"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-cyan-50 backdrop-blur-sm">
            <HeartPulse size={16} />
            Tra cứu sức khỏe rõ ràng hơn mỗi ngày
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Ur Pharmacy
          </h1>

          <p className="mt-4 text-2xl font-bold leading-tight text-cyan-50 sm:text-3xl">
            Tìm bệnh, tra thuốc và hỏi đáp sức khỏe trong một nơi dễ dùng.
          </p>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-100 sm:text-lg">
            Giao diện được thiết kế để bạn đọc nhanh, hiểu đúng ý chính và chuyển sang
            chatbot hoặc diễn đàn khi cần trao đổi thêm.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/diseases"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-blue-700 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-50"
            >
              <Search size={18} />
              Tra cứu bệnh
            </Link>
            <Link
              to="/chatbot"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Hỏi chatbot
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl gap-3 text-sm text-slate-50 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <span className="text-emerald-200">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 hidden w-full items-center justify-between rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur-md md:flex">
          <span className="inline-flex items-center gap-2">
            <Bot size={16} className="text-emerald-200" />
            Hỗ trợ tra cứu nhanh, nội dung chỉ mang tính tham khảo
          </span>
          <Link to="/drugs" className="font-semibold text-cyan-100 hover:text-white">
            Xem danh mục thuốc
          </Link>
        </div>
      </div>
    </section>
  );
}
