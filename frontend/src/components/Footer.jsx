import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Ur Pharmacy</h3>
          <p className="mt-3 text-sm leading-7">
            Website hỗ trợ tra cứu bệnh, thuốc và thông tin sức khỏe cơ bản cho người dùng.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Liên kết</h3>
          <div className="mt-3 space-y-2 text-sm">
            <Link to="/diseases" className="block hover:text-white">
              Tra cứu bệnh
            </Link>
            <Link to="/drugs" className="block hover:text-white">
              Tra cứu thuốc
            </Link>
            <Link to="/forum" className="block hover:text-white">
              Diễn đàn
            </Link>
            <Link to="/chatbot" className="block hover:text-white">
              Chatbot
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Thông tin</h3>
          <p className="mt-3 text-sm leading-7">
            Đây chỉ là đồ án tốt nghiệp, thông tin chỉ mang tính tham khảo và hỗ trợ ban đầu.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-400">
        (c) 2026 Ur Pharmacy
      </div>
    </footer>
  );
}
