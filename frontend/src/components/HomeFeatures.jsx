import { motion } from "framer-motion";
import { MessageCircle, Search, ShieldCheck, Users } from "lucide-react";

export default function HomeFeatures() {
  const items = [
    {
      icon: <Search size={24} />,
      title: "Tra cứu bệnh và thuốc",
      desc: "Tìm thông tin bệnh, thuốc và nội dung liên quan trong hệ thống.",
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Chatbot",
      desc: "Hỗ trợ tra lời nhanh một số câu hỏi đơn giản của người dùng.",
    },
    {
      icon: <Users size={24} />,
      title: "Diễn đàn",
      desc: "Nơi để đặt câu hỏi và trao đổi với người dùng khác.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Quản lý nội dung",
      desc: "Admin có thể cập nhật dữ liệu bệnh, thuốc và tài khoản.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900">Chức năng chính</h2>
          <p className="mt-3 text-gray-600">
            Một số tính năng chính được xây dựng trong hệ thống.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-xl bg-gray-50 p-6 shadow-sm"
            >
              <div className="mb-4 text-blue-600">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
