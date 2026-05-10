import { HeartPulse, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-cyan-100/80 bg-white/90 text-slate-600 backdrop-blur">
      <div className="up-shell grid gap-8 py-10 md:grid-cols-[1.25fr_0.85fr_0.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
              <HeartPulse size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">Ur Pharmacy</h3>
              <p className="text-xs font-medium text-slate-500">Health information workspace</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7">
            Website hỗ trợ tra cứu bệnh, thuốc và thông tin sức khỏe cơ bản cho người dùng.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-cyan-700" />
              support@urpharmacy.local
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-cyan-700" />
              Dự án tốt nghiệp
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Liên kết
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            <FooterLink to="/diseases">Tra cứu bệnh</FooterLink>
            <FooterLink to="/drugs">Tra cứu thuốc</FooterLink>
            <FooterLink to="/forum">Diễn đàn</FooterLink>
            <FooterLink to="/chatbot">Chatbot</FooterLink>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
            Thông tin
          </h3>
          <p className="mt-4 text-sm leading-7">
            Đây là đồ án tốt nghiệp, thông tin chỉ mang tính tham khảo và hỗ trợ ban đầu.
          </p>
          <Link to="/terms" className="up-btn-secondary mt-5 px-4 py-2.5">
            <ShieldCheck size={16} />
            Điều khoản sử dụng
          </Link>
        </div>
      </div>

      <div className="border-t border-cyan-100/80 py-4 text-center text-sm text-slate-500">
        © 2026 Ur Pharmacy
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="block font-medium text-slate-600 transition hover:text-cyan-700">
      {children}
    </Link>
  );
}
