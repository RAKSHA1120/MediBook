import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Menu,
} from "lucide-react";
import { getStoredNotifications } from "../data/notifications";
import { getCurrentUser } from "../utils/storage";

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotifUpdate = () => {
      const allNotifications = getStoredNotifications();
      const currentUser = getCurrentUser();
      if (!currentUser) {
          setUnreadCount(allNotifications.filter(n => !n.read).length);
      } else {
          setUnreadCount(allNotifications.filter(n => !n.read && (!n.userId || n.userId === currentUser.id || n.userId === currentUser.refId)).length);
      }
    };
    
    // Initial fetch
    handleNotifUpdate();
    
    window.addEventListener("medibook_notifications_updated", handleNotifUpdate);
    return () => {
      window.removeEventListener("medibook_notifications_updated", handleNotifUpdate);
    };
  }, []);

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
          onClick={() => {
            if (onNotificationClick) {
              onNotificationClick();
            } else {
              navigate("/notifications");
            }
          }}
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
          title="View Patient Profile"
          onClick={() => {
            if (onProfileClick) {
              onProfileClick();
            } else {
              navigate("/profile");
            }
          }}
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