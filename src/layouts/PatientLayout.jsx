import { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import PatientSidebar from "../components/PatientSidebar";
import { getCurrentUser, getCurrentPatient, getCurrentDoctor } from "../utils/storage";
import { getPatientInitials } from "../data/patientProfile";
import "../pages/PatientDashboard.css";

function PatientLayout({ children }) {
  // Collapsible sidebar state defaulting to expanded (isCollapsed: false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("medibook_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const [sessionUser, setSessionUser] = useState(() => {
    try {
      const u = getCurrentUser();
      if (!u) return null;
      if (u.role === "doctor") {
        const doc = getCurrentDoctor();
        return {
          ...doc,
          ...u,
          name: doc?.name || u.name,
          role: "doctor"
        };
      }
      const p = getCurrentPatient();
      return { ...u, ...p, role: u.role || "patient" };
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
        const u = getCurrentUser();
        if (!u) {
          setSessionUser(null);
          return;
        }
        if (u.role === "doctor") {
          const doc = getCurrentDoctor();
          setSessionUser({
            ...doc,
            ...u,
            name: doc?.name || u.name,
            role: "doctor"
          });
        } else {
          const p = getCurrentPatient();
          setSessionUser({ ...u, ...p, role: u.role || "patient" });
        }
      } catch (e) {}
    };
    handleProfileUpdate();
    window.addEventListener("medibook_current_user_updated", handleProfileUpdate);
    window.addEventListener("medibook_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("medibook_current_user_updated", handleProfileUpdate);
      window.removeEventListener("medibook_profile_updated", handleProfileUpdate);
    };
  }, []);

  const isDashboard = location.pathname === "/patient-dashboard";

  if (!sessionUser) {
      return <Navigate to="/login" replace />;
  }

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
          userName={sessionUser?.name || "User"}
          userRole={sessionUser?.role || "user"}
          avatarLetter={getPatientInitials(sessionUser?.name)}
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
