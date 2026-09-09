import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CalendarClock,
  Settings,
  User,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from "lucide-react";
import { clearCurrentUser } from "../utils/auth";
import "../pages/PatientDashboard.css";

function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !isCollapsed || isHovered || isMobileOpen;

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== "/doctor/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
    { path: "/doctor/patients", label: "Patients", icon: Users },
    { path: "/doctor/schedule", label: "Schedule", icon: CalendarClock },
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
            onClick={() => handleNavClick("/doctor/dashboard")}
            title="MediBook Doctor Portal"
            style={{ cursor: "pointer" }}
          >
            <Stethoscope className="brand-logo-icon" size={24} />
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
                  Doctor
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

        {/* Footer: Doctor Profile & Settings & Logout */}
        <div className="patient-sidebar-footer">
          <button
            className={`patient-sidebar-item ${isActive("/doctor/settings") ? "active" : ""}`}
            onClick={() => handleNavClick("/doctor/settings")}
            title={!isExpanded ? "Settings" : undefined}
          >
            <div className="sidebar-icon-container">
              <Settings size={18} className="sidebar-item-icon" />
            </div>
            {isExpanded && <span className="sidebar-item-label">Settings</span>}
          </button>

          <button
            className={`patient-sidebar-item ${isActive("/doctor/profile") ? "active" : ""}`}
            onClick={() => handleNavClick("/doctor/profile")}
            title={!isExpanded ? "Profile" : undefined}
          >
            <div className="sidebar-icon-container">
              <User size={18} className="sidebar-item-icon" />
            </div>
            {isExpanded && <span className="sidebar-item-label">Profile</span>}
          </button>

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

export default Sidebar;