import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HospitalSidebar from "../components/HospitalSidebar";
import { getCurrentUser } from "../utils/auth";

import "../pages/PatientDashboard.css";

function HospitalLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("medibook_hospital_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hospitalInfo, setHospitalInfo] = useState({ name: "MediCare Hospital", avatarLetter: "H" });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("medibook_hospital_sidebar_collapsed", isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "hospital") {
      // Guard route
      if (user?.role === "admin") navigate("/admin/dashboard");
      else if (user?.role === "doctor") navigate("/doctor/dashboard");
      else if (user?.role === "patient") navigate("/patient-dashboard");
      else navigate("/login");
      return;
    }

    const hospitals = getHospitals();
    const match = hospitals.find((h) => h.id === user.refId || h.name === user.name);
    const hosName = match ? match.name : user.name || "MediCare Hospital";
    const letter = hosName.charAt(0).toUpperCase() || "H";

    setHospitalInfo({ name: hosName, avatarLetter: letter });
  }, [navigate]);

  return (
    <div className="patient-dashboard-layout">
      {/* Dynamic Collapsible Hospital Sidebar */}
      <HospitalSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="patient-dashboard-main">
        {/* Top Navbar */}
        <Navbar
          userName={hospitalInfo.name}
          userRole="Hospital Administrator"
          avatarLetter={hospitalInfo.avatarLetter}
          hideTabs={true}
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
          onNotificationClick={() => navigate("/hospital/notifications")}
          onProfileClick={() => navigate("/hospital/profile")}
        />

        {/* Dynamic Child Page Container */}
        <div className="patient-dashboard-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default HospitalLayout;
