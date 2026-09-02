import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  Users,
  Bell,
  User,
  Settings,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { clearCurrentUser } from "../utils/storage";
import "./PatientSidebar.css";

function HospitalSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !isCollapsed || isHovered || isMobileOpen;

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== "/hospital/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/hospital/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/hospital/doctors", label: "Doctors", icon: Stethoscope },
    { path: "/hospital/appointments", label: "Appointments", icon: CalendarDays },
    { path: "/hospital/patients", label: "Patients", icon: Users },
    { path: "/hospital/notifications", label: "Notifications", icon: Bell },
    { path: "/hospital/profile", label: "Profile", icon: User },
    { path: "/hospital/settings", label: "Settings", icon: Settings }
  ];

  const handleNavClick = (path) => {
    navigate(path);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleMouseEnter = () => {
    if (isCollapsed) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isCollapsed) setIsHovered(false);
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
    setIsHovered(false);
  };

  return (
    <>
      <aside
        className={`patient-sidebar ${isCollapsed ? "collapsed" : "expanded"} ${
          isCollapsed && isHovered ? "hover-expanded" : ""
        } ${isMobileOpen ? "open" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Brand Header */}
        <div className="patient-sidebar-brand">
          <div
            className="brand-logo-group"
            onClick={() => handleNavClick("/hospital/dashboard")}
            title="MediBook Hospital Portal"
          >
            <Heart className="brand-logo-icon" size={24} />
            {isExpanded && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="brand-title">MediBook</span>
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: "700",
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                    padding: "2px 7px",
                    borderRadius: "12px",
                    border: "1px solid rgba(47, 111, 163, 0.2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  Hospital
                </span>
              </div>
            )}
          </div>

          <button
            className="sidebar-toggle-btn"
            onClick={handleToggleClick}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="patient-sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                className={`patient-sidebar-item ${active ? "active" : ""}`}
                onClick={() => handleNavClick(item.path)}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="sidebar-icon-container">
                  <Icon size={18} className="sidebar-item-icon" />
                </div>
                {isExpanded && (
                  <div className="sidebar-label-group">
                    <span className="sidebar-item-label">{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Logout */}
        <div className="patient-sidebar-footer">
          <button
            className="patient-sidebar-item logout"
            onClick={() => {
              if (setIsMobileOpen) setIsMobileOpen(false);
              clearCurrentUser();
              navigate("/login");
            }}
            title={!isExpanded ? "Logout" : undefined}
          >
            <div className="sidebar-icon-container">
              <LogOut size={18} className="sidebar-item-icon" />
            </div>
            {isExpanded && <span className="sidebar-item-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)}></div>
      )}
    </>
  );
}

export default HospitalSidebar;
