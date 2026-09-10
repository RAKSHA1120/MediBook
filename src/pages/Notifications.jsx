import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, Calendar, Info, BellOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import NotificationCard from "../components/NotificationCard";
import { useNotification } from "../context/NotificationContext";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotification();

  const [activeTab, setActiveTab] = useState("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Mount only - fetch fresh notifications when user navigates to the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter Counts
  const counts = useMemo(() => {
    const all = notifications.length;
    const appointments = notifications.filter((n) => n.type === "appointment").length;
    const reminders = notifications.filter((n) => n.type === "reminder").length;
    const system = notifications.filter((n) => n.type === "system").length;
    const unread = notifications.filter((n) => !n.read && !n.isRead).length;
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
  const handleMarkAll = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Handle Notification Click
  const handleCardClick = async (notif) => {
    if (!notif.read && !notif.isRead) {
      await markAsRead(notif.id);
    }
    if (notif.appointmentId) {
      navigate(`/appointments/${notif.appointmentId}`);
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
            <button
              className="btn-mark-all-read"
              onClick={handleMarkAll}
              disabled={isMarkingAll}
              aria-label="Mark all as read"
            >
              <CheckCheck size={16} />
              <span>{isMarkingAll ? "Marking..." : "Mark all as read"}</span>
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