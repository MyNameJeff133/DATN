import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getStoredToken } from "../services/authStorage";

export default function AdminRoute({ children }) {
  const token = getStoredToken();

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
