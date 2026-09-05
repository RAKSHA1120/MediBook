import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import "../pages/PatientDashboard.css"; // Shared layout system

function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("medibook_admin_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("medibook_admin_sidebar_collapsed", isCollapsed);
  }, [isCollapsed]);

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("medibook_current_user");
      if (userStr) return JSON.parse(userStr);
      return null;
    } catch (e) { return null; }
  });

  if (!adminUser || adminUser.role?.toLowerCase() !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="patient-dashboard-layout">
      {/* Dynamic Collapsible Sidebar */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="patient-dashboard-main">
        {/* Top Navbar */}
        <Navbar
          userName="System Admin"
          userRole="Administrator"
          avatarLetter="A"
          hideTabs={true}
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
          onNotificationClick={() => navigate("/admin/notifications")}
          onProfileClick={() => navigate("/admin/profile")}
        />

        {/* Dynamic Child Page */}
        <div className="patient-dashboard-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
