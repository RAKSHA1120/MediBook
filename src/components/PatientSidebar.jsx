import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Calendar,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarClock
} from "lucide-react";
import Button from "./Button";
import { getStoredNotifications } from "../data/notifications";
import { getCurrentUser, getCurrentPatient, getPatientNotifications, clearCurrentUser } from "../utils/storage";
import "./PatientSidebar.css";

function PatientSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync notification unread count dynamically for current patient
  useEffect(() => {
    const updateUnread = () => {
      try {
        const p = getCurrentPatient();
        const u = getCurrentUser();
        const notifs = getPatientNotifications(p?.id, u?.id);
        const unread = notifs.filter((n) => !n.read).length;
        setUnreadCount(unread);
      } catch (e) {
        setUnreadCount(0);
      }
    };
    updateUnread();
    window.addEventListener("medibook_notifications_updated", updateUnread);
    return () => window.removeEventListener("medibook_notifications_updated", updateUnread);
  }, []);

  // Determine if sidebar is currently in expanded visual mode
  const isExpanded = !isCollapsed || isHovered || isMobileOpen;

  const isActive = (path, altPath) => {
    if (location.pathname === path) return true;
    if (altPath && location.pathname.startsWith(altPath)) return true;
    if (path !== "/patient-dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const user = getCurrentUser();
  const isDoctor = user && user.role === "doctor";

  const patientItems = [
    { path: "/patient-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/my-appointments", label: "My Appointments", icon: Calendar, altPath: "/appointments" },
    { path: "/notifications", label: "Notifications", icon: Bell, showBadge: true },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/help-support", label: "Help & Support", icon: HelpCircle }
  ];

  const doctorItems = [
    { path: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/doctor/appointments", label: "My Appointments", icon: Calendar },
    { path: "/doctor/patients", label: "Patients", icon: Users },
    { path: "/doctor/schedule", label: "Schedule", icon: CalendarClock },
    { path: "/doctor/notifications", label: "Notifications", icon: Bell, showBadge: true },
    { path: "/doctor/profile", label: "Profile", icon: User },
    { path: "/doctor/settings", label: "Settings", icon: Settings }
  ];

  const navItems = isDoctor ? doctorItems : patientItems;

  const handleNavClick = (path) => {
    navigate(path);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setIsHovered(false);
    }
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
            onClick={() => handleNavClick(isDoctor ? "/doctor/dashboard" : "/patient-dashboard")}
            title="MediBook Home"
          >
            <Heart className="brand-logo-icon" size={24} />
            {isExpanded && <span className="brand-title">MediBook</span>}
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
            const active = isActive(item.path, item.altPath);
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
                  {item.showBadge && unreadCount > 0 && !isExpanded && (
                    <span className="sidebar-badge-dot">{unreadCount}</span>
                  )}
                </div>

                {isExpanded && (
                  <div className="sidebar-label-group">
                    <span className="sidebar-item-label">{item.label}</span>
                    {item.showBadge && unreadCount > 0 && (
                      <span className="sidebar-badge-count">{unreadCount}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Need Help & Logout */}
        <div className="patient-sidebar-footer">
          {isExpanded ? (
            <div className="support-card">
              <span className="support-card-title">Need Help?</span>
              <p className="support-card-text">
                Our support team is available 24/7 to answer your queries.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="btn-support"
                onClick={() => handleNavClick("/help-support")}
              >
                Contact Support
              </Button>
            </div>
          ) : (
            <div
              className="support-card-collapsed"
              title="Need Help? Contact Support"
              onClick={() => handleNavClick("/help-support")}
            >
              <HelpCircle size={20} className="support-compact-icon" />
            </div>
          )}

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
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
}

export default PatientSidebar;
