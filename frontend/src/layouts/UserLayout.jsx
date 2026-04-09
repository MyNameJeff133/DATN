import { Outlet } from "react-router-dom";
import ChatbotWidget from "../components/ChatbotWidget";
import Footer from "../components/Footer";
import Header from "../components/Header";

const UserLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default UserLayout;
