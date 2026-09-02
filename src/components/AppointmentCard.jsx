import { Calendar, Clock, Receipt, Eye, CalendarDays, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import "./AppointmentCard.css";

function AppointmentCard({
  appointment,
  onView,
  onCancel,
  onReschedule,
  className = ""
}) {
  if (!appointment) return null;

  const rawDocName = appointment.doctorName || appointment.doctor;
  const docName = String(rawDocName ?? "").trim() !== "" ? String(rawDocName).trim() : "N/A";

  const rawSpecialty = appointment.specialty || appointment.type;
  const specialty = String(rawSpecialty ?? "").trim() !== "" ? String(rawSpecialty).trim() : "N/A";

  const rawHospital = appointment.hospital || appointment.hospitalName;
  const hospital = String(rawHospital ?? "").trim() !== "" ? String(rawHospital).trim() : "N/A";

  const rawLocation = appointment.location;
  const location = String(rawLocation ?? "").trim() !== "" ? String(rawLocation).trim() : "";

  const feeVal = appointment.consultationFee ?? appointment.fee;
  const fee = feeVal !== null && feeVal !== undefined ? feeVal : "N/A";

  const initials = docName !== "N/A"
    ? docName
        .split(" ")
        .filter((n) => String(n ?? "").toLowerCase() !== "dr.")
        .map((n) => (n && n[0] ? n[0] : ""))
        .join("")
        .substring(0, 2)
        .toUpperCase() || "DR"
    : "DR";

  const normStatus = String(appointment.status || "upcoming").toLowerCase().trim();
  const isUpcoming = normStatus === "upcoming" || normStatus === "confirmed" || normStatus === "scheduled";

  // Readable Date Formatter
  let displayDate = appointment.formattedDate || appointment.date || "N/A";
  if (appointment.date && String(appointment.date).includes("-")) {
    try {
      const [y, m, d] = String(appointment.date).split("-");
      if (y && m && d) {
        const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        if (!isNaN(dateObj.getTime())) {
          displayDate = dateObj.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          });
        }
      }
    } catch (e) {}
  }

  return (
    <div className={`appointment-card-component ${className}`}>
      {/* Top Row: Doctor Details & Status */}
      <div className="appt-card-top-row">
        <div className="appt-card-doc-info">
          <div className="appt-card-avatar">{initials}</div>
          <div className="appt-card-doc-details">
            <h3 className="appt-card-doc-name">{docName}</h3>
            <span className="appt-card-doc-spec">{specialty}</span>
            <div className="appt-card-hospital">
              <span>{hospital}</span>
              {location && <span>• {location}</span>}
            </div>
          </div>
        </div>

        <StatusBadge status={appointment.status} />
      </div>

      {/* Middle Grid: Date, Time, Consultation Fee */}
      <div className="appt-card-middle-grid">
        <div className="appt-grid-item">
          <div className="appt-grid-icon-wrap">
            <Calendar size={18} />
          </div>
          <div className="appt-grid-content">
            <span className="appt-grid-label">Date</span>
            <span className="appt-grid-value">{displayDate}</span>
          </div>
        </div>

        <div className="appt-grid-item">
          <div className="appt-grid-icon-wrap">
            <Clock size={18} />
          </div>
          <div className="appt-grid-content">
            <span className="appt-grid-label">Time Slot</span>
            <span className="appt-grid-value">{appointment.time || "10:30 AM"}</span>
          </div>
        </div>

        <div className="appt-grid-item">
          <div className="appt-grid-icon-wrap">
            <Receipt size={18} />
          </div>
          <div className="appt-grid-content">
            <span className="appt-grid-label">Consultation Fee</span>
            <span className="appt-grid-value">₹{fee}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="appt-card-actions">
        {onView && (
          <SecondaryButton onClick={() => onView(appointment)}>
            <Eye size={15} style={{ marginRight: "6px" }} />
            View Appointment
          </SecondaryButton>
        )}

        {isUpcoming && onReschedule && (
          <PrimaryButton onClick={() => onReschedule(appointment)}>
            <CalendarDays size={15} style={{ marginRight: "6px" }} />
            Reschedule
          </PrimaryButton>
        )}

        {isUpcoming && onCancel && (
          <SecondaryButton
            onClick={() => onCancel(appointment)}
            className="btn-cancel-action"
          >
            <X size={15} style={{ marginRight: "6px" }} />
            Cancel
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;
