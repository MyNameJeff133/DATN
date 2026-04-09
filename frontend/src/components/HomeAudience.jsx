import { motion } from "framer-motion";
import { GraduationCap, Stethoscope, User } from "lucide-react";

export default function HomeAudience() {
  const audiences = [
    {
      icon: <User size={24} />,
      title: "Người dùng phổ thông",
      desc: "Tra cứu thông tin cơ bản về bệnh và thuốc.",
    },
    {
      icon: <GraduationCap size={24} />,
      title: "Sinh viên y dược",
      desc: "Hỗ trợ tìm kiếm nội dung phục vụ học tập và tham khảo.",
    },
    {
      icon: <Stethoscope size={24} />,
      title: "Người có chuyên môn",
      desc: "Có thể theo dõi nội dung và đóng góp dữ liệu cho hệ thống.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
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
            Hệ thống hướng tới nhiều nhóm người dùng khác nhau.
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
              className="rounded-xl bg-white p-6 text-center shadow-sm"
            >
              <div className="mb-4 flex justify-center text-blue-600">{item.icon}</div>
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
