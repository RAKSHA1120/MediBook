import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, Calendar, Info, BellOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import NotificationCard from "../components/NotificationCard";
import {
  getCurrentUser,
  getCurrentDoctor,
  getDoctorNotifications,
  markNotificationAsRead,
  markAllDoctorNotificationsAsRead
} from "../utils/storage";
import "./Notifications.css";

function DoctorNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadDoctorNotifications();

    const handleUpdate = () => loadDoctorNotifications();
    window.addEventListener("medibook_notifications_updated", handleUpdate);
    return () => window.removeEventListener("medibook_notifications_updated", handleUpdate);
  }, []);

  const loadDoctorNotifications = () => {
    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    const doctorNotifs = getDoctorNotifications(doc?.id, user?.id);
    setNotifications(doctorNotifs);
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
    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    markAllDoctorNotificationsAsRead(doc?.id, user?.id);
    loadDoctorNotifications();
  };

  const handleCardClick = (notif) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
      loadDoctorNotifications();
    }
    if (notif.appointmentId) {
      navigate(`/doctor/appointments`);
    }
  };

  const getEmptyStateProps = () => {
    if (activeTab === "appointments") {
      return {
        icon: Calendar,
        title: "No Patient Appointment Alerts",
        description: "You have no upcoming appointment updates or patient schedule changes."
      };
    }
    if (activeTab === "reminders") {
      return {
        icon: Bell,
        title: "No Clinical Reminders",
        description: "You have no active patient reminders or consultation alerts."
      };
    }
    if (activeTab === "system") {
      return {
        icon: Info,
        title: "No System Notifications",
        description: "There are no hospital or system administration notices available."
      };
    }
    return {
      icon: BellOff,
      title: "No Notifications Found",
      description: "You're all caught up! Patient updates and appointment notifications will appear here."
    };
  };

  return (
    <main className="patient-dashboard-content">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on your upcoming appointments and patient alerts."
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

export default DoctorNotifications;
