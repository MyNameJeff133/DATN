import { motion } from "framer-motion";
import { MessageCircle, Search, ShieldCheck, Users } from "lucide-react";

export default function HomeFeatures() {
  const items = [
    {
      icon: <Search size={24} />,
      title: "Tra cứu bệnh và thuốc",
      desc: "Tìm thông tin theo tên, xem mô tả, triệu chứng, công dụng và lưu ý quan trọng.",
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Chatbot",
      desc: "Đặt câu hỏi ngắn để nhận phản hồi nhanh và lưu lịch sử khi đã đăng nhập.",
    },
    {
      icon: <Users size={24} />,
      title: "Diễn đàn",
      desc: "Đăng bài, bình luận và theo dõi các thảo luận liên quan đến sức khỏe.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Góp ý nội dung",
      desc: "Người dùng có thể gửi góp ý khi thấy thông tin cần kiểm tra hoặc cập nhật.",
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
            Các thao tác thường dùng được đặt ở những vị trí dễ tìm và dễ quét nhanh.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-cyan-50 p-3 text-cyan-700 transition group-hover:bg-cyan-100">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
