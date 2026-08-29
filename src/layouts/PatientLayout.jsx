import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import PatientSidebar from "../components/PatientSidebar";
import { getCurrentUser } from "../utils/storage";
import { getPatientInitials } from "../data/patientProfile";
import "../pages/PatientDashboard.css";

function PatientLayout({ children }) {
  // Collapsible sidebar state defaulting to expanded (isCollapsed: false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("medibook_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const [patient, setPatient] = useState(() => {
    try {
      const p = getCurrentUser();
      return p || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem("medibook_sidebar_collapsed", isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const p = getCurrentUser();
        if (p) setPatient(p);
      } catch (e) {}
    };
    window.addEventListener("medibook_current_user_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("medibook_current_user_updated", handleProfileUpdate);
    };
  }, []);

  const isDashboard = location.pathname === "/patient-dashboard";

  return (
    <div className="patient-dashboard-layout">
      {/* 1. Dynamic Collapsible Sidebar */}
      <PatientSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. Main Content Area */}
      <div className="patient-dashboard-main">
        {/* Top Navbar */}
        <Navbar
          userName={patient?.name || "Raksha"}
          userRole={patient?.role || "Patient"}
          avatarLetter={getPatientInitials(patient?.name)}
          hideTabs={true}
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Dynamic Child Page */}
        <div className="patient-dashboard-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PatientLayout;
