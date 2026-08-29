import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { getNotifications, markNotificationAsRead, getCurrentUser } from "../utils/storage";
import { CheckCheck } from "lucide-react";

function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener("medibook_notifications_updated", handleUpdate);
    return () => window.removeEventListener("medibook_notifications_updated", handleUpdate);
  }, []);

  const loadNotifications = () => {
    const user = getCurrentUser();
    const allNotifs = getNotifications();
    // Filter notifications for this doctor. Since it's a demo, we show notifications mentioning them
    // or appointment notifications in general if their name is involved.
    const myNotifs = allNotifs.filter(n => 
        (user && n.message?.toLowerCase().includes(user.name?.toLowerCase().replace("dr. ", ""))) ||
        n.type === "appointment_booking"
    );
    setNotifications(myNotifs);
  };

  const handleMarkAllRead = () => {
     const unread = notifications.filter(n => !n.read);
     unread.forEach(n => markNotificationAsRead(n.id));
     loadNotifications();
  };

  return (
    <main className="patient-dashboard-content">
      <PageHeader 
        title="Notifications" 
        subtitle="Stay updated on your upcoming appointments and patient alerts."
      >
        <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck size={16} style={{marginRight: "5px"}}/> Mark All Read
            </Button>
        </div>
      </PageHeader>

      <div className="recent-activity-card">
        <div className="recent-activity-list">
          {notifications.map(notif => (
            <div key={notif.id} className="activity-item" style={{ borderLeft: !notif.read ? "4px solid #0284c7" : "1px solid #e2e8f0", backgroundColor: !notif.read ? "#f0f9ff" : "#ffffff" }}>
              <div className="activity-content">
                <div className="activity-title-row">
                  <h4 className="activity-title" style={{ color: "#0f172a" }}>{notif.title}</h4>
                  <span className="activity-time" style={{ color: "#64748b" }}>{notif.createdAt || notif.time}</span>
                </div>
                <p className="activity-message" style={{ color: "#334155" }}>{notif.message}</p>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <p style={{padding: '1rem', color: '#64748b'}}>No notifications yet.</p>}
        </div>
      </div>
    </main>
  );
}

export default DoctorNotifications;
