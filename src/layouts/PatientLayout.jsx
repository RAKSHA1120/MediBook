import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Calendar,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  User,
  Heart
} from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { getStoredPatientProfile, getPatientInitials } from "../data/patientProfile";
import "../pages/PatientDashboard.css"; // Ensure styles are loaded

function PatientLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = useState(() => {
    try {
      const p = getStoredPatientProfile();
      return p || { name: "Raksha", role: "Patient" };
    } catch (e) {
      return { name: "Raksha", role: "Patient" };
    }
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const p = getStoredPatientProfile();
        if (p) setPatient(p);
      } catch (e) {}
    };
    window.addEventListener("medibook_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("medibook_profile_updated", handleProfileUpdate);
    };
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="patient-dashboard-layout">
      {/* 1. Left Sidebar */}
      <aside className={`patient-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="patient-sidebar-brand">
          <Heart className="brand-logo-icon" size={24} />
          <span>MediBook</span>
        </div>

        <nav className="patient-sidebar-nav">
          <button className={`patient-sidebar-item ${isActive("/patient-dashboard") ? "active" : ""}`} onClick={() => navigate("/patient-dashboard")}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button className={`patient-sidebar-item ${isActive("/doctors") ? "active" : ""}`} onClick={() => navigate("/doctors")}>
            <Search size={18} />
            <span>Find Doctor</span>
          </button>

          <button className={`patient-sidebar-item ${isActive("/my-appointments") || isActive("/appointments") ? "active" : ""}`} onClick={() => navigate("/my-appointments")}>
            <Calendar size={18} />
            <span>My Appointments</span>
          </button>

          <button className={`patient-sidebar-item ${isActive("/notifications") ? "active" : ""}`} onClick={() => navigate("/notifications")}>
            <Bell size={18} />
            <span>Notifications</span>
          </button>

          <button className={`patient-sidebar-item ${isActive("/profile") ? "active" : ""}`} onClick={() => navigate("/profile")}>
            <User size={18} />
            <span>Profile</span>
          </button>

          <button className={`patient-sidebar-item ${isActive("/settings") ? "active" : ""}`} onClick={() => navigate("/settings")}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button className={`patient-sidebar-item ${isActive("/help-support") ? "active" : ""}`} onClick={() => navigate("/help-support")}>
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </button>
        </nav>

        <div className="patient-sidebar-footer">
          <div className="support-card">
            <span className="support-card-title">Need Help?</span>
            <p className="support-card-text">Our support team is available 24/7 to answer your queries.</p>
            <Button variant="primary" size="sm" className="btn-support" onClick={() => navigate("/help-support", { state: { openModal: true } })}>
              Contact Support
            </Button>
          </div>
          
          <div className="logout-container">
            <button className="patient-sidebar-item logout" onClick={() => navigate("/login")}>
              <span className="logout-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="patient-dashboard-main">
        {/* Top Navbar */}
        <Navbar
          userName={patient?.name || "Raksha"}
          userRole={patient?.role || "Patient"}
          avatarLetter={getPatientInitials(patient?.name)}
          hideTabs={true}
          hideSearch={false}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Dynamic Page Content */}
        <div className="patient-dashboard-content" style={{ padding: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PatientLayout;
