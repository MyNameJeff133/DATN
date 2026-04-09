import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User } from "lucide-react";
import api from "../services/api";

export default function Header() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  const searchRef = useRef();
  const menuRef = useRef();

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
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null);
      }

      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search?q=${query}`);
      setResults(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="min-w-fit">
          <h1 className="text-2xl font-bold text-blue-700">Ur Pharmacy</h1>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-700 lg:flex">
          <Link to="/diseases" className="hover:text-blue-600">
            Bệnh lý
          </Link>
          <Link to="/drugs" className="hover:text-blue-600">
            Thuốc
          </Link>
          <Link to="/forum" className="hover:text-blue-600">
            Diễn đàn
          </Link>
          <Link to="/chatbot" className="hover:text-blue-600">
            Chatbot
          </Link>
        </nav>

        <div ref={searchRef} className="relative ml-auto hidden w-full max-w-md lg:block">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Tim benh, thuoc..."
            className="w-full rounded-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          {results && (
            <div className="absolute top-12 w-full rounded-lg border bg-white p-2 shadow-lg">
              {results.diseases?.length > 0 && (
                <>
                  <p className="px-2 py-1 text-xs text-gray-400">Benh</p>
                  {results.diseases.map((d) => (
                    <Link
                      key={d._id}
                      to={`/diseases?id=${d._id}`}
                      className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {d.name}
                    </Link>
                  ))}
                </>
              )}

              {results.drugs?.length > 0 && (
                <>
                  <p className="mt-2 px-2 py-1 text-xs text-gray-400">Thuoc</p>
                  {results.drugs.map((d) => (
                    <Link
                      key={d._id}
                      to={`/drugs?id=${d._id}`}
                      className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {d.name}
                    </Link>
                  ))}
                </>
              )}

              {results.drugs?.length === 0 && results.diseases?.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400">Khong tim thay ket qua</p>
              )}
            </div>
          )}
        </div>

        {!token && (
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Đăng ký
            </Link>
          </div>
        )}

        {token && (
          <div ref={menuRef} className="relative flex items-center gap-3">
            <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
              <Bell size={20} />
            </button>

            <button
              onClick={() => setOpenMenu((prev) => !prev)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              <User size={20} />
            </button>

            {openMenu && (
              <div className="absolute right-0 top-11 w-44 rounded-lg border bg-white py-2 shadow-lg">
                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
