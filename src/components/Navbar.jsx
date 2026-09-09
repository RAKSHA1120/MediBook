import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Users,
  CalendarDays,
  Menu,
  User,
  LogOut,
} from "lucide-react";
import {
  getCurrentUser,
  clearCurrentUser,
  getCurrentDoctor,
  getCurrentPatient
} from "../utils/auth";
import {
  getPatientNotifications,
  getDoctorNotifications
} from "../data/notifications";
import { useNotification } from "../context/NotificationContext";


function Navbar({
  userName = "Raksha N",
  userRole = "Patient",
  avatarLetter = "R",
  hideTabs = false,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount: contextUnreadCount } = useNotification();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on navigation / route change during render without triggering effect cascading renders
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsDropdownOpen(false);
  }

  useEffect(() => {
    const handleNotifUpdate = async () => {
      try {
        const user = getCurrentUser();
        let unread = 0;

        if (user && user.role === "doctor") {
          const doc = getCurrentDoctor();
          const docId = doc?.id ?? user?.refId ?? user?.id;
          const notifs = await getDoctorNotifications(docId, user?.id);
          unread = notifs.filter((n) => !n.read).length;
        } else if (user && user.role === "patient") {
          const patient = getCurrentPatient();
          const pId = patient?.id ?? user?.refId ?? user?.id;
          const notifs = await getPatientNotifications(pId, user?.id);
          unread = notifs.filter((n) => !n.read).length;
        }

        setUnreadCount(unread);
      } catch {
        setUnreadCount(0);
      }
    };

    // Initial fetch
    handleNotifUpdate();

    window.addEventListener("medibook_notifications_updated", handleNotifUpdate);
    return () => {
      window.removeEventListener("medibook_notifications_updated", handleNotifUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Close dropdown on Escape key for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleBellClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      const user = getCurrentUser();
      if (user?.role === "doctor" || location.pathname.startsWith("/doctor")) {
        navigate("/doctor/notifications");
      } else if (user?.role === "admin" || location.pathname.startsWith("/admin")) {
        navigate("/admin/notifications");
      } else if (user?.role?.toLowerCase() === "hospital" || location.pathname.startsWith("/hospital")) {
        navigate("/hospital/notifications");
      } else {
        navigate("/notifications");
      }
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const getProfilePath = () => {
    const user = getCurrentUser();
    const role = (user?.role || userRole || "").toLowerCase();

    if (role.includes("doctor") || location.pathname.startsWith("/doctor")) {
      return "/doctor/profile";
    }
    if (role.includes("hospital") || location.pathname.startsWith("/hospital")) {
      return "/hospital/profile";
    }
    if (role.includes("admin") || location.pathname.startsWith("/admin")) {
      return "/admin/profile";
    }
    return "/profile";
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate(getProfilePath());
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    clearCurrentUser();
    navigate("/login");
  };

  return (
    <header className="navbar">
      {/* Left Navigation Controls / Drawer Toggle */}
      <div className="navbar-left">
        {onMenuClick && (
          <button className="navbar-menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
            <Menu size={20} />
          </button>
        )}

        {!hideTabs && (
          <nav className="navbar-tabs">
            <button className="navbar-tab active">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button className="navbar-tab">
              <Users size={18} />
              <span>Patients</span>
            </button>
            <button className="navbar-tab">
              <CalendarDays size={18} />
              <span>Appointments</span>
            </button>
          </nav>
        )}
      </div>

      {/* Right - Notifications & User Profile */}
      <div className="navbar-right">
        {/* Notification */}
        {(() => {
          const displayUnread = contextUnreadCount !== undefined ? contextUnreadCount : unreadCount;
          return (
            <button
              className="navbar-icon-button"
              title="Notifications"
              onClick={handleBellClick}
            >
              <Bell size={20} />

              {displayUnread > 0 && (
                <span className="notification-badge">
                  {displayUnread}
                </span>
              )}
            </button>
          );
        })()}

        {/* Profile Dropdown */}
        <div className="navbar-profile-container" ref={dropdownRef}>
          <button
            type="button"
            className={`navbar-profile ${isDropdownOpen ? "open" : ""}`}
            title="User menu"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-label="User profile menu"
            onClick={toggleDropdown}
          >
            <span className="profile-avatar">
              {avatarLetter}
            </span>

            <span className="profile-info">
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </span>

            <ChevronDown size={16} className="profile-chevron" />
          </button>

          {isDropdownOpen && (
            <div
              className="navbar-profile-dropdown"
              role="menu"
              aria-orientation="vertical"
              aria-label="User options"
            >
              <button
                type="button"
                className="navbar-profile-item"
                role="menuitem"
                onClick={handleViewProfile}
              >
                <User size={16} className="dropdown-item-icon" />
                <span>View Profile</span>
              </button>

              <div className="navbar-profile-divider" />

              <button
                type="button"
                className="navbar-profile-item logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={16} className="dropdown-item-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;