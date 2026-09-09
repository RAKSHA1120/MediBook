import { CheckCircle2, XCircle, Clock, Check, AlertCircle } from "lucide-react";
import "./StatusBadge.css";

function StatusBadge({ status = "upcoming", className = "" }) {
  const norm = String(status || "").toLowerCase().trim();

  let label = "Confirmed";
  let variantClass = "status-upcoming";
  let IconComponent = CheckCircle2;

  if (norm === "upcoming" || norm === "confirmed") {
    label = "Confirmed";
    variantClass = "status-upcoming";
    IconComponent = CheckCircle2;
  } else if (norm === "active") {
    label = "Active";
    variantClass = "status-upcoming";
    IconComponent = CheckCircle2;
  } else if (norm === "pending") {
    label = "Pending";
    variantClass = "status-available";
    IconComponent = Clock;
  } else if (norm === "inactive") {
    label = "Inactive";
    variantClass = "status-cancelled";
    IconComponent = XCircle;
  } else if (norm === "completed") {
    label = "Completed";
    variantClass = "status-completed";
    IconComponent = CheckCircle2;
  } else if (norm === "cancelled") {
    label = "Cancelled";
    variantClass = "status-cancelled";
    IconComponent = XCircle;
  } else if (norm === "available") {
    label = "Available";
    variantClass = "status-available";
    IconComponent = Clock;
  } else if (norm === "booked") {
    label = "Booked";
    variantClass = "status-booked";
    IconComponent = XCircle;
  } else if (norm === "selected") {
    label = "Selected";
    variantClass = "status-selected";
    IconComponent = Check;
  } else if (norm === "disabled" || norm === "unavailable") {
    label = "Unavailable";
    variantClass = "status-disabled";
    IconComponent = AlertCircle;
  } else {
    label = status;
    variantClass = "status-upcoming";
    IconComponent = CheckCircle2;
  }

  return (
    <div className={`status-badge-capsule ${variantClass} ${className}`}>
      {IconComponent && <IconComponent size={14} />}
      <span>{label}</span>
    </div>
  );
}

export default StatusBadge;
