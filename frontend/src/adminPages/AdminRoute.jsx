import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin-portal-urpharmacy" />;
  }

  try {
    const decoded = jwtDecode(token);

    if (!["admin", "moderator"].includes(decoded.role)) {
      return <Navigate to="/" />;
    }

    return children;
  } catch {
    return <Navigate to="/" />;
  }
}
