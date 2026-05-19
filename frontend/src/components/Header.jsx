import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  HeartPulse,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import api from "../services/api";
import { clearAuthStorage, getStoredToken } from "../services/authStorage";
import ThemeToggle from "../components/ThemeToggle";

const navItems = [
  { path: "/diseases", label: "Bệnh lý" },
  { path: "/drugs", label: "Thuốc" },
  { path: "/forum", label: "Diễn đàn" },
  { path: "/chatbot", label: "Chatbot" },
  { path: "/terms", label: "Điều khoản" },
];

export default function Header() {
  const token = getStoredToken();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openMobileNav, setOpenMobileNav] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef();
  const menuRef = useRef();
  const notificationRef = useRef();

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return { notifications: [], unreadCount: 0 };
    }

    try {
      const res = await api.get("/notifications");
      const nextNotifications = res.data.notifications || [];
      const nextUnreadCount = res.data.unreadCount || 0;

      setNotifications(nextNotifications);
      setUnreadCount(nextUnreadCount);
      return { notifications: nextNotifications, unreadCount: nextUnreadCount };
    } catch {
      setNotifications([]);
      setUnreadCount(0);
      return { notifications: [], unreadCount: 0 };
    }
  }, [token]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length < 1) {
        setResults(null);
        return;
      }

      api
        .get(`/search?q=${query}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults(null));
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handleClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults(null);
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (!token) {
      return undefined;
    }

    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, [token, fetchNotifications]);

  useEffect(() => {
    setOpenMobileNav(false);
    setResults(null);
  }, [location.pathname]);

  const handleSubmit = (event) => {
    if (event.key === "Enter" && query.trim()) {
      navigate(`/search?q=${query}`);
      setResults(null);
      setOpenMobileNav(false);
    }
  };

  const handleLogout = () => {
    clearAuthStorage();
    navigate("/");
    window.location.reload();
  };

  const handleOpenNotifications = async () => {
    const nextOpen = !openNotifications;
    setOpenNotifications(nextOpen);

    if (!nextOpen) {
      return;
    }

    const latestData = await fetchNotifications();

    if (latestData.unreadCount > 0) {
      try {
        await api.patch("/notifications/read-all");
        setUnreadCount(0);
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      } catch {
        // Users can still read notifications if marking them as read fails.
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-100/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="up-shell py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpenMobileNav((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 lg:hidden"
            aria-label="Mở menu"
          >
            {openMobileNav ? <X size={19} /> : <Menu size={19} />}
          </button>

          <Link to="/" className="min-w-fit">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/10">
                <HeartPulse size={21} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-normal text-slate-950">
                  Ur Pharmacy
                </h1>
                <p className="hidden text-xs font-medium text-slate-500 sm:block">
                  Tra cứu sức khỏe dễ hiểu hơn
                </p>
              </div>
            </div>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(`${item.path}/`));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <SearchBox
            refEl={searchRef}
            query={query}
            setQuery={setQuery}
            results={results}
            onKeyDown={handleSubmit}
            className="relative ml-auto hidden w-full max-w-md md:block"
          />

          <div className="ml-3 hidden md:flex">
            <ThemeToggle />
          </div>

          {!token && (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="up-btn-secondary px-4 py-2.5">
                Đăng nhập
              </Link>
              <Link to="/register" className="up-btn-primary px-4 py-2.5">
                Đăng ký
              </Link>
            </div>
          )}

          {token && (
            <div className="flex items-center gap-2">
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={handleOpenNotifications}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
                  aria-label="Thông báo"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {openNotifications && (
                  <div className="absolute right-0 top-14 z-20 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white py-2 shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="text-sm font-bold text-slate-950">Thông báo</div>
                      <div className="text-xs text-slate-400">Cập nhật gần đây của bạn</div>
                    </div>

                    {notifications.length === 0 ? (
                      <p className="px-4 py-5 text-sm text-slate-500">
                        Chưa có thông báo nào.
                      </p>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((item) => (
                          <div
                            key={item._id}
                            className={`border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 ${
                              item.isRead ? "bg-white text-slate-600" : "bg-cyan-50 text-slate-800"
                            }`}
                          >
                            {item.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu((prev) => !prev)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
                  aria-label="Tài khoản"
                >
                  <User size={19} />
                </button>

                {openMenu && (
                  <div className="absolute right-0 top-14 z-20 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ShieldCheck size={16} />
                      Thông tin cá nhân
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {openMobileNav && (
          <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl lg:hidden">
            <SearchBox
              refEl={searchRef}
              query={query}
              setQuery={setQuery}
              results={results}
              onKeyDown={handleSubmit}
              className="relative"
            />

            <nav className="mt-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(`${item.path}/`));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block rounded-2xl px-3 py-3 text-sm font-bold ${
                      isActive
                        ? "bg-cyan-50 text-cyan-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {!token && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/login" className="up-btn-secondary py-2.5">
                  Đăng nhập
                </Link>
                <Link to="/register" className="up-btn-primary py-2.5">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function SearchBox({ refEl, query, setQuery, results, onKeyDown, className }) {
  return (
    <div ref={refEl} className={className}>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Tìm bệnh, thuốc..."
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
      <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

      {results && (
        <div className="absolute top-14 z-20 w-full rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
          {results.diseases?.length > 0 && (
            <>
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Bệnh
              </p>
              {results.diseases.map((disease) => (
                <Link
                  key={disease._id}
                  to={`/diseases?id=${disease._id}`}
                  className="block rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {disease.name}
                </Link>
              ))}
            </>
          )}

          {results.drugs?.length > 0 && (
            <>
              <p className="mt-1 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Thuốc
              </p>
              {results.drugs.map((drug) => (
                <Link
                  key={drug._id}
                  to={`/drugs?id=${drug._id}`}
                  className="block rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  {drug.name}
                </Link>
              ))}
            </>
          )}

          {results.drugs?.length === 0 && results.diseases?.length === 0 && (
            <p className="px-3 py-3 text-sm text-slate-400">Không tìm thấy kết quả</p>
          )}
        </div>
      )}
    </div>
  );
}
