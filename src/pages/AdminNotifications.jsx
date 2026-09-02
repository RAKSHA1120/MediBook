import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, Calendar, Info, BellOff, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import NotificationCard from "../components/NotificationCard";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} from "../utils/storage";
import "./Notifications.css";

function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadAdminNotifications();

    const handleUpdate = () => loadAdminNotifications();
    window.addEventListener("medibook_notifications_updated", handleUpdate);
    return () => window.removeEventListener("medibook_notifications_updated", handleUpdate);
  }, []);

  const loadAdminNotifications = () => {
    const allNotifs = getNotifications();
    setNotifications(allNotifs);
  };

  const counts = useMemo(() => {
    const all = notifications.length;
    const appointments = notifications.filter(
      (n) => n.type === "appointment" || n.type === "appointment_booking" || n.appointmentId
    ).length;
    const reminders = notifications.filter((n) => n.type === "reminder").length;
    const system = notifications.filter((n) => n.type === "system" || (!n.type && !n.appointmentId)).length;
    const unread = notifications.filter((n) => !n.read).length;
    return { all, appointments, reminders, system, unread };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "appointments") {
      return notifications.filter(
        (n) => n.type === "appointment" || n.type === "appointment_booking" || n.appointmentId
      );
    }
    if (activeTab === "reminders") {
      return notifications.filter((n) => n.type === "reminder");
    }
    if (activeTab === "system") {
      return notifications.filter((n) => n.type === "system" || (!n.type && !n.appointmentId));
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAll = () => {
    markAllNotificationsAsRead();
    loadAdminNotifications();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    loadAdminNotifications();
  };

  const handleCardClick = (notif) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
      loadAdminNotifications();
    }
    if (notif.appointmentId) {
      navigate(`/admin/appointments/${notif.appointmentId}`);
    }
  };

  const getEmptyStateProps = () => {
    if (activeTab === "appointments") {
      return {
        icon: Calendar,
        title: "No System Appointment Alerts",
        description: "There are no appointment activity logs recorded across the network."
      };
    }
    if (activeTab === "reminders") {
      return {
        icon: Bell,
        title: "No System Reminders",
        description: "There are no pending operational reminders for system administrators."
      };
    }
    if (activeTab === "system") {
      return {
        icon: Info,
        title: "No System Logs",
        description: "There are no system update or maintenance notifications."
      };
    }
    return {
      icon: BellOff,
      title: "No Notifications Found",
      description: "You're all caught up! System logs and admin alerts will appear here."
    };
  };

  return (
    <main className="patient-dashboard-content">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        subtitle="System alerts, registrations, and important updates"
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            {counts.unread > 0 && (
              <button className="btn-mark-all-read" onClick={handleMarkAll}>
                <CheckCheck size={16} />
                <span>Mark all as read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                className="btn-mark-all-read"
                onClick={handleClearAll}
                style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderColor: "#fecaca"
                }}
              >
                <Trash2 size={16} />
                <span>Clear all</span>
              </button>
            )}
          </div>
        }
      />

      {/* Filter Tabs Bar */}
      <div className="notifications-tabs-bar" role="tablist" style={{ marginBottom: "24px" }}>
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
    </main>
  );
}

export default AdminNotifications;
