import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Button from "./Button";
import "../components/PatientSidebar.css"; // Reuse the sidebar CSS

function AdminSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !isCollapsed || isHovered || isMobileOpen;

  const isActive = (path) => {
    if (location.pathname === path) return true;
    if (path !== "/admin/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/doctors", label: "Doctors", icon: Stethoscope },
    { path: "/admin/patients", label: "Patients", icon: Users },
    { path: "/admin/appointments", label: "Appointments", icon: CalendarDays },
    { path: "/admin/notifications", label: "Notifications", icon: Bell },
    { path: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
    { path: "/admin/settings", label: "Settings", icon: Settings },
    { path: "/admin/help", label: "Help & Support", icon: HelpCircle }
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
            onClick={() => handleNavClick("/admin/dashboard")}
            title="Admin Home"
          >
            <ShieldAlert className="brand-logo-icon" size={24} style={{ color: "var(--primary-color)" }} />
            {isExpanded && <span className="brand-title">Admin</span>}
          </div>

          <button
            className="sidebar-toggle-btn"
            onClick={handleToggleClick}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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

        {/* Footer */}
        <div className="patient-sidebar-footer">
          <button
            className="patient-sidebar-item logout"
            onClick={() => {
              if (setIsMobileOpen) setIsMobileOpen(false);
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

export default AdminSidebar;
