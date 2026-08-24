import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Bell,
  Info,
  ChevronRight
} from "lucide-react";
import "./NotificationCard.css";

function NotificationCard({ notification, onClick }) {
  const navigate = useNavigate();
  const { id, type, subType, title, message, createdAt, read, appointmentId } = notification;

  // Determine icon & style variant
  const getIconAndStyle = () => {
    const s = (subType || type || "").toLowerCase();

    if (s.includes("confirm")) {
      return { icon: CheckCircle2, variant: "confirmed" };
    }
    if (s.includes("resched")) {
      return { icon: Clock, variant: "rescheduled" };
    }
    if (s.includes("cancel")) {
      return { icon: XCircle, variant: "cancelled" };
    }
    if (type === "reminder" || s.includes("remind")) {
      return { icon: Bell, variant: "reminder" };
    }
    if (type === "appointment") {
      return { icon: Calendar, variant: "confirmed" };
    }
    return { icon: Info, variant: "system" };
  };

  const { icon: IconComponent, variant } = getIconAndStyle();

  const handleClick = (e) => {
    if (onClick) {
      onClick(notification);
    } else {
      if (appointmentId) {
        navigate(`/appointment/${appointmentId}`);
      }
    }
  };

  return (
    <div
      className={`notification-card ${read ? "read" : "unread"}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      <div className={`notification-icon-bubble type-${variant}`}>
        <IconComponent size={20} />
      </div>

      <div className="notification-content">
        <div className="notification-header-row">
          <div className="notification-title-block">
            <h4 className="notification-title">{title}</h4>
            {!read && <span className="unread-dot-badge" title="Unread notification" />}
          </div>
        </div>

        <p className="notification-message">{message}</p>

        <div className="notification-meta-row">
          <div className="notification-time">
            <Clock size={13} />
            <span>{createdAt}</span>
          </div>

          {appointmentId && (
            <span className="notification-action-link">
              View Details <ChevronRight size={13} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
