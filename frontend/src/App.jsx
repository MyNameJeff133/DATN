import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Diseases from "./pages/Diseases";
import Drugs from "./pages/Drugs";
import Forum from "./pages/Forum";
import Chatbot from "./pages/Chatbot";
import Terms from "./pages/Terms";
import ForumDetail from "./pages/ForumDetail";
import SearchResults from "./components/SearchResults";
import Profile from "./userPages/UserProfile";
// Admin
import AdminLogin from "./adminPages/AdminLogin";
import AdminDashboard from "./adminPages/AdminDashboard";
import AdminUsers from "./adminPages/AdminUsers";
import AdminDiseases from "./adminPages/AdminDiseases";
import AdminDrugs from "./adminPages/AdminDrugs";
import AdminForumReports from "./adminPages/AdminForumReports";
import AdminRoute from "./adminPages/AdminRoute";
// Components & Services
import UserLayout from "./layouts/UserLayout";
import VerifyEmail from "./services/VerifyEmail";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC & USER ROUTES ================= */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify/:token" element={<VerifyEmail />} />
          
          <Route path="diseases" element={<Diseases />} />
          <Route path="drugs" element={<Drugs />} />
          
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<ForumDetail />} />
          
          <Route path="search" element={<SearchResults />} />
          
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="terms" element={<Terms />} />
          
          <Route path="profile" element={<Profile />} />
        </Route>
    
        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin-portal-urpharmacy" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="diseases" element={<AdminDiseases />} />
          <Route path="drugs" element={<AdminDrugs />} />
          <Route path="forum-reports" element={<AdminForumReports />} />
        </Route>

        {/* 404 Page (Nếu cần) */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
