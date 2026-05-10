import { motion } from "framer-motion";
import { CheckCircle2, Search, ShieldCheck } from "lucide-react";

const introPoints = [
  "Tìm thông tin bệnh và thuốc nhanh hơn",
  "Nội dung được sắp xếp theo từng mục dễ đọc",
  "Có gợi ý gửi góp ý khi phát hiện thông tin cần bổ sung",
];

export default function HomeIntro() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <img src="/docto2.png" alt="Bác sĩ" className="mx-auto max-w-sm drop-shadow-sm" />
          <div className="mx-auto mt-4 max-w-sm rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-emerald-700">
              <ShieldCheck size={16} />
              Thông tin tham khảo
            </div>
            <p className="mt-1 leading-6">
              Hệ thống giúp bạn định hướng ban đầu, không thay thế tư vấn y khoa trực tiếp.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
            <Search size={16} />
            Tra cứu nhanh
          </span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Thông tin sức khỏe được trình bày gọn, dễ đọc hơn.
          </h2>
          <p className="mt-5 text-base leading-8 text-gray-600">
            Ur Pharmacy hỗ trợ tra cứu bệnh, thuốc và các nội dung sức khỏe cơ bản.
            Mỗi trang được tổ chức theo nhóm thông tin rõ ràng để người dùng có thể
            đọc nhanh và tiếp tục tìm hiểu khi cần.
          </p>

          <div className="mt-6 space-y-3">
            {introPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
