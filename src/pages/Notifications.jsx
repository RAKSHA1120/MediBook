import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, Calendar, Info, BellOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import NotificationCard from "../components/NotificationCard";
import {
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../data/notifications";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const [allNotifications, setAllNotifications] = useState(() => getStoredNotifications());
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Sync state if external changes happen
  useEffect(() => {
    import("../utils/storage").then(module => setCurrentUser(module.getCurrentUser()));
    const handleUpdate = () => {
      setAllNotifications(getStoredNotifications());
    };
    window.addEventListener("medibook_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("medibook_notifications_updated", handleUpdate);
    };
  }, []);

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return allNotifications.filter(n => !n.userId || n.userId === currentUser.id || n.userId === currentUser.refId);
  }, [allNotifications, currentUser]);

  // Filter Counts
  const counts = useMemo(() => {
    const all = notifications.length;
    const appointments = notifications.filter((n) => n.type === "appointment").length;
    const reminders = notifications.filter((n) => n.type === "reminder").length;
    const system = notifications.filter((n) => n.type === "system").length;
    const unread = notifications.filter((n) => !n.read).length;
    return { all, appointments, reminders, system, unread };
  }, [notifications]);

  // Filtered Notifications list
  const filteredNotifications = useMemo(() => {
    if (activeTab === "appointments") {
      return notifications.filter((n) => n.type === "appointment");
    }
    if (activeTab === "reminders") {
      return notifications.filter((n) => n.type === "reminder");
    }
    if (activeTab === "system") {
      return notifications.filter((n) => n.type === "system");
    }
    return notifications;
  }, [notifications, activeTab]);

  // Handle Mark All As Read
  const handleMarkAll = () => {
    const updated = markAllNotificationsAsRead();
    setAllNotifications(updated);
  };

  // Handle Notification Click
  const handleCardClick = (notif) => {
    if (!notif.read) {
      const updated = markNotificationAsRead(notif.id);
      setAllNotifications(updated);
    }
    if (notif.appointmentId) {
      navigate(`/appointment/${notif.appointmentId}`);
    }
  };

  // Get Empty state copy per tab
  const getEmptyStateProps = () => {
    if (activeTab === "appointments") {
      return {
        icon: Calendar,
        title: "No Appointment Notifications",
        description: "You don't have any appointment confirmations, rescheduling or cancellation updates."
      };
    }
    if (activeTab === "reminders") {
      return {
        icon: Bell,
        title: "No Upcoming Reminders",
        description: "You have no active appointment reminders at this moment."
      };
    }
    if (activeTab === "system") {
      return {
        icon: Info,
        title: "No System Notifications",
        description: "There are no system updates or general alerts available."
      };
    }
    return {
      icon: BellOff,
      title: "No Notifications Found",
      description: "You're all caught up! Important updates and reminders will appear here."
    };
  };

  return (
    <div className="notifications-page">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your appointments and important alerts."
        action={
          counts.unread > 0 ? (
            <button className="btn-mark-all-read" onClick={handleMarkAll}>
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          ) : null
        }
      />

      {/* Filter Tabs Bar */}
      <div className="notifications-tabs-bar" role="tablist">
        <button
          className={`notifications-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
          role="tab"
          aria-selected={activeTab === "all"}
        >
          <span>All</span>
          <span className="notifications-tab-count">{counts.all}</span>
        </button>

        <button
          className={`notifications-tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
          role="tab"
          aria-selected={activeTab === "appointments"}
        >
          <span>Appointments</span>
          <span className="notifications-tab-count">{counts.appointments}</span>
        </button>

        <button
          className={`notifications-tab-btn ${activeTab === "reminders" ? "active" : ""}`}
          onClick={() => setActiveTab("reminders")}
          role="tab"
          aria-selected={activeTab === "reminders"}
        >
          <span>Reminders</span>
          <span className="notifications-tab-count">{counts.reminders}</span>
        </button>

        <button
          className={`notifications-tab-btn ${activeTab === "system" ? "active" : ""}`}
          onClick={() => setActiveTab("system")}
          role="tab"
          aria-selected={activeTab === "system"}
        >
          <span>System</span>
          <span className="notifications-tab-count">{counts.system}</span>
        </button>
      </div>

      {/* Notification Cards List */}
      {filteredNotifications.length > 0 ? (
        <div className="notifications-list">
          {filteredNotifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onClick={handleCardClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState {...getEmptyStateProps()} />
      )}
    </div>
  );
}

export default Notifications;