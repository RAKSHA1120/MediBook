import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Menu,
} from "lucide-react";
import { getCurrentUser } from "../utils/auth";


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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotifUpdate = () => {
      try {
        const user = getCurrentUser();
        let unread = 0;

        if (user && user.role === "doctor") {
          const doc = getCurrentDoctor();
          const docId = doc?.id ?? user?.refId ?? user?.id;
          const notifs = getDoctorNotifications(docId, user?.id);
          unread = notifs.filter((n) => !n.read).length;
        } else if (user && user.role === "patient") {
          const patient = getCurrentPatient();
          const pId = patient?.id ?? user?.refId ?? user?.id;
          const notifs = getPatientNotifications(pId, user?.id);
          unread = notifs.filter((n) => !n.read).length;
        } else {
          const allNotifications = getNotifications();
          unread = allNotifications.filter((n) => !n.read).length;
        }

        setUnreadCount(unread);
      } catch (e) {
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

  const handleBellClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      const user = getCurrentUser();
      if (user?.role === "doctor" || location.pathname.startsWith("/doctor")) {
        navigate("/doctor/notifications");
      } else if (user?.role === "admin" || location.pathname.startsWith("/admin")) {
        navigate("/admin/notifications");
      } else {
        navigate("/notifications");
      }
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      const user = getCurrentUser();
      if (user?.role === "doctor" || location.pathname.startsWith("/doctor")) {
        navigate("/doctor/profile");
      } else if (user?.role === "admin" || location.pathname.startsWith("/admin")) {
        navigate("/admin/profile");
      } else {
        navigate("/profile");
      }
    }
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
        <button
          className="navbar-icon-button"
          title="Notifications"
          onClick={handleBellClick}
        >
          <Bell size={20} />

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          className="navbar-profile"
          title="View Profile"
          onClick={handleProfileClick}
        >
          <span className="profile-avatar">
            {avatarLetter}
          </span>

          <span className="profile-info">
            <strong>{userName}</strong>
            <small>{userRole}</small>
          </span>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;