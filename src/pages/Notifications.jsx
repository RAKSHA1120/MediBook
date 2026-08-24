import { useState } from "react";
import "./Notifications.css";

function Notifications() {
    const initialNotifications = [
        {
            id: 1,
            type: "appointment",
            color: "blue",
            icon: "📅",
            title: "Upcoming Appointment Reminder",
            message: "You have an appointment with Dr. Rahul Verma on Sat, 24 May 2025 at 10:00 AM.",
            timeTop: "9:00 AM",
            dateBottom: "May 23, 2025",
            timeBottom: "9:00 AM",
            read: false
        },
        {
            id: 2,
            type: "appointment",
            color: "green",
            icon: "✔️",
            title: "Appointment Confirmed",
            message: "Your appointment with Dr. Anjali Mehta on Tue, 27 May 2025 at 03:30 PM has been confirmed.",
            timeTop: "11:15 AM",
            dateBottom: "May 20, 2025",
            timeBottom: "11:15 AM",
            read: false
        },
        {
            id: 3,
            type: "appointment",
            color: "yellow",
            icon: "📢",
            title: "Appointment Rescheduled",
            message: "Your appointment with Dr. Sundeep Bhat has been rescheduled to Mon, 19 May 2025 at 11:00 AM.",
            timeTop: "4:20 PM",
            dateBottom: "May 18, 2025",
            timeBottom: "4:20 PM",
            read: false
        },
        {
            id: 4,
            type: "appointment",
            color: "red",
            icon: "❌",
            title: "Appointment Cancelled",
            message: "Your appointment with Dr. Neha Kapoor on Fri, 16 May 2025 at 02:00 PM has been cancelled.",
            timeTop: "10:05 AM",
            dateBottom: "May 15, 2025",
            timeBottom: "10:05 AM",
            read: false
        },
        {
            id: 5,
            type: "reminder",
            color: "purple",
            icon: "🔔",
            title: "Reminder: Complete Pre-Visit",
            message: "Please complete your pre-visit details before your appointment with Dr. Rahul Verma.",
            timeTop: "May 14",
            dateBottom: "May 14, 2025",
            timeBottom: "6:00 PM",
            read: true
        },
        {
            id: 6,
            type: "system",
            color: "teal",
            icon: "📄",
            title: "Prescription Available",
            message: "Your prescription for the appointment on 12 May 2025 is now available. You can view it in My Appointments.",
            timeTop: "May 12",
            dateBottom: "May 12, 2025",
            timeBottom: "1:30 PM",
            read: true
        },
        {
            id: 7,
            type: "system",
            color: "blue",
            icon: "💬",
            title: "Feedback Request",
            message: "We value your feedback! Please share your experience for your appointment with Dr. Sundeep Bhat.",
            timeTop: "May 10",
            dateBottom: "May 10, 2025",
            timeBottom: "5:45 PM",
            read: true
        },
        {
            id: 8,
            type: "system",
            color: "gray",
            icon: "ℹ️",
            title: "Welcome to MediBook!",
            message: "Thank you for choosing MediBook. We're here to take care of your health.",
            timeTop: "May 08",
            dateBottom: "May 08, 2025",
            timeBottom: "10:00 AM",
            read: true
        }
    ];

    const [notifications, setNotifications] = useState(initialNotifications);
    const [activeFilter, setActiveFilter] = useState("all");

    const tabs = [
        { id: "all", label: "All (8)" },
        { id: "appointment", label: "Appointments (6)" },
        { id: "reminder", label: "Reminders (2)" },
        { id: "system", label: "System (0)" }
    ];

    const filteredNotifications = activeFilter === "all" 
        ? notifications 
        : notifications.filter(n => n.type === activeFilter);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <h1>Notifications</h1>
                <p>Stay updated with your appointments and important alerts.</p>
            </div>

            <div className="notifications-controls">
                <div className="notifications-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`notif-tab ${activeFilter === tab.id ? "active" : ""}`}
                            onClick={() => setActiveFilter(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <button className="mark-read-btn" onClick={markAllAsRead}>
                    ✓ Mark all as read
                </button>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                        No notifications to show.
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div className="notification-card" key={notification.id}>
                            <div className={`notification-icon-container ${notification.color}`}>
                                {notification.icon}
                            </div>
                            <div className="notification-content">
                                <div className="notif-top-row">
                                    <h3 className="notif-title">{notification.title}</h3>
                                    <span className="notif-time-top">{notification.timeTop}</span>
                                </div>
                                <p className="notif-message">{notification.message}</p>
                                <div className="notif-date-bottom">
                                    📅 {notification.dateBottom} • {notification.timeBottom}
                                </div>
                            </div>
                            {!notification.read && <div className="unread-dot"></div>}
                        </div>
                    ))
                )}
            </div>

            <div className="pagination">
                <button className="page-btn">&lt;</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">&gt;</button>
            </div>
        </div>
    );
}

export default Notifications;