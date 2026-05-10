import { motion } from "framer-motion";
import { GraduationCap, Stethoscope, User } from "lucide-react";

export default function HomeAudience() {
  const audiences = [
    {
      icon: <User size={24} />,
      title: "Người dùng phổ thông",
      desc: "Tra cứu thông tin cơ bản về bệnh, thuốc và các lưu ý thường gặp.",
    },
    {
      icon: <GraduationCap size={24} />,
      title: "Sinh viên y dược",
      desc: "Tìm nhanh nội dung tham khảo để phục vụ học tập và ghi chú cá nhân.",
    },
    {
      icon: <Stethoscope size={24} />,
      title: "Người có chuyên môn",
      desc: "Theo dõi nội dung, xử lý góp ý và hỗ trợ cập nhật dữ liệu chính xác hơn.",
    },
  ];

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">Đối tượng sử dụng</h2>
          <p className="mt-3 text-gray-600">
            Mỗi nhóm người dùng đều có lối đi nhanh tới thông tin mình cần.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {audiences.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-gray-500">
          * Hệ thống không thay thế cho chẩn đoán y khoa. Thông tin chỉ mang tính tham khảo.
        </p>
      </div>
    </section>
  );
}
