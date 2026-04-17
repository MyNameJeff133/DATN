import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");

  const isAdmin = currentRole === "admin";

  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Loi tai users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

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
        : window.prompt(
            "Nhập ly do khoa tai khoan:",
            "Tai khoan vi pham quy dinh",
          ) || "";

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
      alert(
        error.response?.data?.message || "Khong the cap nhat trang thai khoa",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Xoa tai khoan ${user.email}?`)) {
      return;
    }

    try {
      setActionLoading(`${user._id}-delete`);
      await api.delete(`/auth/users/${user._id}`);
      setUsers((prev) => prev.filter((item) => item._id !== user._id));
    } catch (error) {
      alert(error.response?.data?.message || "Khong the xoa tai khoan");
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
    if (role === "admin") return "bg-red-100 text-red-600";
    if (role === "moderator") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-600";
  };

  const filteredUsers = users.filter((user) => {
    if (!selectedLetter) return true;
    return user.name?.toUpperCase().startsWith(selectedLetter);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quan ly nguoi dung</h1>
        <p className="mt-2 text-gray-600">
          {loading
            ? "Dang tai du lieu..."
            : `${users.length} tai khoan trong he thong`}
        </p>
      </div>

      {!isAdmin && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tài khoản của kiểm duyệt viên chỉ được xem danh sách người dùng. Các thao tác bổ nhiệm, khóa và xóa tài khoản chỉ dành cho admin.
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedLetter("")}
          className={`px-3 py-1 rounded ${
            selectedLetter === "" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>

        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`px-3 py-1 rounded ${
              selectedLetter === letter
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Ten
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Vai tro
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Trang thai
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Vi pham
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Hanh dong
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t align-top">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs ${getRoleClass(user.role)}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    <span
                      className={`inline-flex rounded px-2 py-1 text-xs ${
                        user.isBanned
                          ? "bg-red-100 text-red-700"
                          : user.isVerified
                            ? "bg-green-100 text-green-600"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.isBanned
                        ? "Da bi khoa"
                        : user.isVerified
                          ? "Da kich hoat"
                          : "Chua kich hoat"}
                    </span>
                    {user.banReason && (
                      <p className="max-w-xs text-xs text-red-600">
                        {user.banReason}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{user.violationCount || 0}</td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      {user.role !== "admin" && (
                        <>
                          <button
                            onClick={() =>
                              handleRoleChange(
                                user,
                                user.role === "moderator"
                                  ? "user"
                                  : "moderator",
                              )
                            }
                            disabled={
                              actionLoading === `${user._id}-role-user` ||
                              actionLoading === `${user._id}-role-moderator`
                            }
                            className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {user.role === "moderator"
                              ? "Thu hoi moderator"
                              : "Bo nhiem moderator"}
                          </button>

                          <button
                            onClick={() => handleBanToggle(user)}
                            disabled={actionLoading === `${user._id}-ban`}
                            className={`rounded px-3 py-1.5 text-xs text-white disabled:opacity-60 ${
                              user.isBanned
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-amber-600 hover:bg-amber-700"
                            }`}
                          >
                            {user.isBanned ? "Mo khoa" : "Khoa"}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading === `${user._id}-delete`}
                            className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Xoa tai khoan
                          </button>
                        </>
                      )}
                      {user.role === "admin" && (
                        <span className="text-xs text-gray-500">
                          Tai khoan admin
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Chi xem</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
