import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { getNotifications, markNotificationAsRead } from "../utils/storage";
import { CheckCheck, Trash2 } from "lucide-react";


function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getNotifications());
    
    const handleUpdate = () => setNotifications(getNotifications());
    window.addEventListener("medibook_notifications_updated", handleUpdate);
    return () => window.removeEventListener("medibook_notifications_updated", handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
     const unread = notifications.filter(n => !n.read);
     unread.forEach(n => markNotificationAsRead(n.id));
     setNotifications(getNotifications());
  };

  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Notifications" 
        subtitle="System alerts, registrations, and important updates"
      >
        <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}><CheckCheck size={16} style={{marginRight: "5px"}}/> Mark All Read</Button>
            <Button variant="outline" size="sm"><Trash2 size={16} style={{marginRight: "5px"}}/> Clear All</Button>
        </div>
      </PageHeader>

      <div className="recent-activity-card">
        <div className="recent-activity-list">
          {notifications.map(notif => (
            <div key={notif.id} className="activity-item" style={{ borderLeft: !notif.read ? "4px solid var(--primary)" : "1px solid var(--border)", backgroundColor: !notif.read ? "var(--primary-soft)" : "var(--background)" }}>
              <div className="activity-content">
                <div className="activity-title-row">
                  <h4 className="activity-title">{notif.title}</h4>
                  <span className="activity-time">{notif.createdAt || notif.time}</span>
                </div>
                <p className="activity-message">{notif.message}</p>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <p style={{padding: '1rem'}}>No notifications yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminNotifications;
