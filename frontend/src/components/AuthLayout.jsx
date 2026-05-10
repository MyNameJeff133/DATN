import { ArrowLeft, CheckCircle2, ShieldCheck, Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthLayout({
  title,
  subtitle,
  children,
  sideTitle = "Chào mừng bạn",
  sideDescription = "Đăng nhập để theo dõi thông tin sức khỏe, tra cứu thuốc và sử dụng đầy đủ tiện ích của Ur Pharmacy.",
}) {
  const navigate = useNavigate();

  return (
    <section className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl justify-end">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="up-btn-secondary"
        >
          <ArrowLeft size={18} />
          Quay về trang chủ
        </button>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_-45px_rgba(14,116,144,0.45)] lg:grid-cols-[1.05fr_1fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-cyan-800 via-cyan-700 to-blue-600 p-12 text-white lg:block">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 shadow-inner backdrop-blur">
                <Stethoscope size={46} strokeWidth={2.2} />
              </div>

              <h1 className="mt-14 max-w-sm text-5xl font-bold leading-tight tracking-normal">
                {sideTitle}
              </h1>
              <p className="mt-8 max-w-xl text-xl leading-9 text-cyan-50">
                {sideDescription}
              </p>
            </div>

            <div className="space-y-5">
              <FeaturePill
                icon={<CheckCircle2 size={26} />}
                title="Tra cứu tiện lợi"
                description="Tìm thuốc, bệnh lý và thông tin y tế nhanh chóng"
              />
              <FeaturePill
                icon={<ShieldCheck size={27} />}
                title="An toàn & bảo mật"
                description="Bảo vệ thông tin tài khoản người dùng"
              />
            </div>
          </div>

          <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-white/15" />
          <div className="absolute -right-12 top-4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-xl">
            <h2 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-500">{subtitle}</p>

            <div className="mt-10">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ icon, title, description }) {
  return (
    <div className="flex items-center gap-5 rounded-3xl bg-white/12 p-5 backdrop-blur">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold">{title}</p>
        <p className="mt-1 text-base leading-7 text-cyan-50">{description}</p>
      </div>
    </div>
  );
}
