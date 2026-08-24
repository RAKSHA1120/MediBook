import { Calendar, Clock, Receipt, Eye, CalendarDays, X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import doctors from "../data/doctors";
import "./AppointmentCard.css";

function AppointmentCard({
  appointment,
  onView,
  onCancel,
  onReschedule,
  className = ""
}) {
  if (!appointment) return null;

  // Resolve Doctor metadata if available
  let doc = null;
  if (appointment.doctorId) {
    doc = doctors.find((d) => String(d.id) === String(appointment.doctorId));
  }
  if (!doc && appointment.doctorName) {
    doc = doctors.find((d) => d.name.toLowerCase() === appointment.doctorName.toLowerCase());
  }

  const docName = appointment.doctorName || doc?.name || "Dr. Emily Carter";
  const specialty = appointment.specialty || doc?.specialty || "Cardiology";
  const hospital = appointment.hospital || doc?.hospital || "MediCare Hospital";
  const location = appointment.location || doc?.location || "Chennai";
  const fee = appointment.consultationFee ?? doc?.consultationFee ?? 800;

  const initials = docName
    .split(" ")
    .filter((n) => n.toLowerCase() !== "dr.")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "DR";

  const normStatus = String(appointment.status || "upcoming").toLowerCase();
  const isUpcoming = normStatus === "upcoming" || normStatus === "confirmed";

  // Readable Date Formatter
  let displayDate = appointment.formattedDate || appointment.date || "August 26, 2026";
  if (appointment.date && appointment.date.includes("-")) {
    try {
      const [y, m, d] = appointment.date.split("-");
      if (y && m && d) {
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        displayDate = dateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
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
