import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Search, ShieldAlert, UserCog } from "lucide-react";
import api from "../services/api";
import { getStoredToken } from "../services/authStorage";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedLetter, setSelectedLetter] = useState("");

  const isAdmin = currentRole === "admin";
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Load users failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getStoredToken();

    if (token) {
      try {
        setCurrentRole(jwtDecode(token).role || "");
      } catch {
        setCurrentRole("");
      }
    }

    fetchUsers();
  }, []);

  const updateUserInList = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user._id === updatedUser._id ? updatedUser : user)),
    );
  };

  const handleRoleChange = async (user, role) => {
    try {
      setActionLoading(`${user._id}-role-${role}`);
      const res = await api.patch(`/auth/users/${user._id}/role`, { role });
      updateUserInList(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật vai trò");
    } finally {
      setActionLoading("");
    }
  };

  const handleBanToggle = async (user) => {
    try {
      setActionLoading(`${user._id}-ban`);
      const reason = user.isBanned
        ? ""
        : window.prompt("Nhập lý do khóa tài khoản:", "Tài khoản vi phạm quy định") || "";

      if (!user.isBanned && !reason.trim()) {
        setActionLoading("");
        return;
      }

      const res = await api.patch(`/auth/users/${user._id}/ban`, {
        isBanned: !user.isBanned,
        reason,
      });

      updateUserInList(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật trạng thái khóa");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) {
      return;
    }

    try {
      setActionLoading(`${user._id}-delete`);
      await api.delete(`/auth/users/${user._id}`);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa tài khoản");
    } finally {
      setActionLoading("");
    }
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Admin";
    if (role === "moderator") return "Moderator";
    return "User";
  };

  const getRoleClass = (role) => {
    if (role === "admin") return "bg-red-50 text-red-700 border-red-100";
    if (role === "moderator") return "bg-violet-50 text-violet-700 border-violet-100";
    return "bg-cyan-50 text-cyan-700 border-cyan-100";
  };

  const normalize = (value) =>
    value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  const filteredUsers = users.filter((user) => {
    const normalizedName = normalize(user.name || "");
    const searchValue = searchTerm.trim().toLowerCase();
    const matchesAlphabet = !selectedLetter || normalizedName.startsWith(selectedLetter);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSearch =
      !searchValue ||
      user.name?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue);

    return matchesAlphabet && matchesRole && matchesSearch;
  });

  return (
    <div>
      <PageHeader
        icon={<UserCog size={17} />}
        title="Quản lý người dùng"
        description={loading ? "Đang tải dữ liệu..." : `${users.length} tài khoản trong hệ thống`}
      />

      {!isAdmin && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          <ShieldAlert className="mt-0.5 shrink-0" size={18} />
          <span>
            Tài khoản kiểm duyệt viên chỉ được xem danh sách người dùng. Các thao tác bổ nhiệm, khóa và xóa tài khoản chỉ dành cho admin.
          </span>
        </div>
      )}

      <div className="up-panel mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="up-field pl-10"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="up-field"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip active={selectedLetter === ""} onClick={() => setSelectedLetter("")}>
          All
        </FilterChip>
        {alphabet.map((letter) => (
          <FilterChip
            key={letter}
            active={selectedLetter === letter}
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </FilterChip>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Tên", "Email", "Vai trò", "Trạng thái", "Vi phạm", "Hành động"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                    Không tìm thấy tài khoản phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td className="px-4 py-4 text-slate-600">{user.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getRoleClass(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <StatusBadge user={user} />
                        {user.banReason && (
                          <p className="max-w-xs text-xs leading-5 text-red-600">
                            {user.banReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{user.violationCount || 0}</td>
                    <td className="px-4 py-4">
                      {isAdmin ? (
                        <div className="flex flex-wrap gap-2">
                          {user.role !== "admin" && (
                            <>
                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    user,
                                    user.role === "moderator" ? "user" : "moderator",
                                  )
                                }
                                disabled={
                                  actionLoading === `${user._id}-role-user` ||
                                  actionLoading === `${user._id}-role-moderator`
                                }
                                className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                              >
                                {user.role === "moderator" ? "Thu hồi moderator" : "Bổ nhiệm moderator"}
                              </button>
                              <button
                                onClick={() => handleBanToggle(user)}
                                disabled={actionLoading === `${user._id}-ban`}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-60 ${
                                  user.isBanned
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-amber-600 hover:bg-amber-700"
                                }`}
                              >
                                {user.isBanned ? "Mở khóa" : "Khóa"}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={actionLoading === `${user._id}-delete`}
                                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                              >
                                Xóa tài khoản
                              </button>
                            </>
                          )}
                          {user.role === "admin" && (
                            <span className="text-xs font-medium text-slate-500">
                              Tài khoản admin
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ icon, title, description }) {
  return (
    <div className="mb-6">
      <span className="up-kicker">{icon} Admin</span>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-cyan-700 bg-cyan-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ user }) {
  const className = user.isBanned
    ? "bg-red-50 text-red-700 border-red-100"
    : user.isVerified
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  const label = user.isBanned
    ? "Đã bị khóa"
    : user.isVerified
      ? "Đã kích hoạt"
      : "Chưa kích hoạt";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${className}`}>
      {label}
    </span>
  );
}
