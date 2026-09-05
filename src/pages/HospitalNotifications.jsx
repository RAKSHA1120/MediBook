import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Bell, Calendar, Info, BellOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import NotificationCard from "../components/NotificationCard";
import { getCurrentUser } from "../utils/auth";

import "./Notifications.css";

function HospitalNotifications() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadHospitalNotifications();

    const handleUpdate = () => loadHospitalNotifications();
    window.addEventListener("medibook_notifications_updated", handleUpdate);
    return () => window.removeEventListener("medibook_notifications_updated", handleUpdate);
  }, []);

  const loadHospitalNotifications = () => {
    const user = getCurrentUser();
    if (!user) return;

    const hospitals = getHospitals();
    const hosRecord = hospitals.find((h) => h.id === user.refId || h.name === user.name) || {
      id: user.refId || "HOS-008",
      name: user.name || "MediCare Hospital"
    };
    setHospital(hosRecord);

    const allNotifs = getNotifications();
    setNotifications(allNotifs);
  };

  const counts = useMemo(() => {
    const all = notifications.length;
    const appointments = notifications.filter(
      (n) => n.type === "appointment" || (n.subType && n.subType.includes("apt")) || n.appointmentId
    ).length;
    const reminders = notifications.filter((n) => n.type === "reminder").length;
    const system = notifications.filter((n) => n.type === "system" || !n.type).length;
    const unread = notifications.filter((n) => !n.read).length;
    return { all, appointments, reminders, system, unread };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "appointments") {
      return notifications.filter(
        (n) => n.type === "appointment" || (n.subType && n.subType.includes("apt")) || n.appointmentId
      );
    }
    if (activeTab === "reminders") {
      return notifications.filter((n) => n.type === "reminder");
    }
    if (activeTab === "system") {
      return notifications.filter((n) => n.type === "system" || !n.type);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAll = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const handleCardClick = (notif) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
      loadHospitalNotifications();
    }
    if (notif.appointmentId) {
      navigate("/hospital/appointments");
    }
  };

  const getEmptyStateProps = () => {
    if (activeTab === "appointments") {
      return {
        icon: Calendar,
        title: "No Appointment Notifications",
        description: "Your hospital has no pending appointment confirmation or cancellation updates."
      };
    }
    if (activeTab === "reminders") {
      return {
        icon: Bell,
        title: "No Facility Reminders",
        description: "There are no operational or schedule reminders for your hospital."
      };
    }
    if (activeTab === "system") {
      return {
        icon: Info,
        title: "No System Notifications",
        description: "There are no system-wide updates or administrative notices."
      };
    }
    return {
      icon: BellOff,
      title: "No Notifications Found",
      description: "You're all caught up! Facility alerts and updates will appear here."
    };
  };

  return (
    <main className="patient-dashboard-content">
      {/* Page Header */}
      <PageHeader
        title="Hospital Notifications"
        subtitle={`Stay updated with operational alerts and appointments for ${hospital?.name || "your hospital"}`}
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

export default HospitalNotifications;
