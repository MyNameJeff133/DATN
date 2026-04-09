import { motion } from "framer-motion";
import { ArrowRight, Pill, Search } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <img
          src="/doctorbg.jpg"
          alt="Bac si tu van suc khoe"
          className="h-full w-full object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,66,180,0.92)_0%,rgba(31,92,221,0.82)_38%,rgba(40,90,186,0.42)_68%,rgba(255,255,255,0.16)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl items-center px-6 py-16 md:px-8 lg:min-h-[82vh]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="max-w-2xl text-white"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-blue-50 backdrop-blur-sm">
            <Pill size={16} />
            Nền tảng tra cứu sức khỏe hiện đại
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Ur Pharmacy
          </h1>

          <p className="mt-4 text-2xl font-bold leading-tight text-blue-100 sm:text-3xl">
            Tư vấn sức khỏe thông minh, tra cứu nhanh và dễ hiểu.
          </p>

          <p className="mt-6 max-w-xl text-base leading-8 text-blue-50/90 sm:text-lg">
            Tìm thông tin về bệnh lý, thuốc và nội dung sức khỏe trong một giao
            diện rõ ràng, thân thiện và phù hợp cho người dùng hàng ngày.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/diseases"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-blue-700 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <Search size={18} />
              Tra cứu bệnh
            </a>
            <a
              href="/drugs"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Tra cứu thuốc
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="mt-10 grid max-w-lg gap-3 text-sm text-blue-50/85 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              Bệnh lý phổ biến
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              Thuốc tham khảo
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              Hỗ trợ nhanh
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
