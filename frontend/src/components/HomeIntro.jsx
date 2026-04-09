import { motion } from "framer-motion";

export default function HomeIntro() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="/docto2.png"
            alt="Doctor"
            className="mx-auto max-w-sm"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-gray-900">Giới thiệu</h2>
          <p className="mt-5 text-base leading-8 text-gray-600">
            Ur Pharmacy là hệ thống web hỗ trợ tra cứu bệnh, thuốc và thông tin sức
            khỏe cơ bản. Mục tiêu của đề tài là xây dựng một giao diện dễ sử dụng,
            giúp người dùng tìm kiếm nội dung nhanh hơn.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
