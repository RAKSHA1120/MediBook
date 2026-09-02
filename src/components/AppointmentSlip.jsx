import React from "react";
import { Heart, Printer, CheckCircle2, ShieldCheck, MapPin, Building2, Calendar, Clock, User, Tag } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";
import { getStoredPatientProfile } from "../data/patientProfile";
import "./AppointmentSlip.css";

function AppointmentSlip({ appointment, patient, showPrintBtn = true, onPrint }) {
  if (!appointment) return null;

  // Resolve Patient profile fallback if missing
  const patientData = patient || getStoredPatientProfile();
  const patientName = appointment?.patientName || appointment?.patient || patientData?.name || "Rahul Sharma";

  const doctorName = appointment?.doctorName || appointment?.doctor || "Dr. Sarah Smith";
  const specialty = appointment?.specialty || appointment?.specialization || "Cardiology";
  const hospital = appointment?.hospital || appointment?.hospitalName || "City Heart Center";
  const location = appointment?.location || "Chennai";
  const fee = appointment?.consultationFee ?? appointment?.fee ?? 1000;
  const appointmentId = appointment?.id || "MB-APT-20260826-101";

  // Format Readable Date
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

  const displayTime = appointment.time || "10:30 AM";
  const status = appointment.status || "confirmed";

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="appointment-slip-card">
      {/* Top Slip Header / Branding */}
      <div className="slip-header">
        <div className="slip-brand">
          <Heart className="slip-brand-logo" size={26} />
          <span className="slip-brand-title">MEDIBOOK</span>
        </div>
        <div className="slip-type-badge">APPOINTMENT SLIP</div>
      </div>

      <div className="slip-divider" />

      {/* Confirmation Status Banner */}
      <div className="slip-status-banner">
        <StatusBadge status={status} className="slip-status-capsule" />
        <p className="slip-status-note">
          {String(status).toLowerCase() === "cancelled"
            ? "This appointment has been cancelled."
            : "Present this confirmation pass at the hospital reception desk."}
        </p>
      </div>

      {/* Main Details Grid */}
      <div className="slip-details-grid">
        <div className="slip-detail-row highlight-id">
          <span className="slip-label">Appointment ID</span>
          <span className="slip-value slip-apt-id">{appointmentId}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Patient Name</span>
          <span className="slip-value">{patientName}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Doctor</span>
          <span className="slip-value doctor-name">{doctorName}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Specialization</span>
          <span className="slip-value">{specialty}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Hospital</span>
          <span className="slip-value">{hospital}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Location</span>
          <span className="slip-value">{location}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Appointment Date</span>
          <span className="slip-value font-semibold">{displayDate}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Appointment Time</span>
          <span className="slip-value font-semibold">{displayTime}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Consultation Fee</span>
          <span className="slip-value fee-amount">₹{fee}</span>
        </div>

        <div className="slip-detail-row">
          <span className="slip-label">Status</span>
          <span className="slip-value status-text">{status.toUpperCase()}</span>
        </div>
      </div>

      {/* Important Instruction Footer */}
      <div className="slip-instruction-box">
        <ShieldCheck size={18} className="slip-instruction-icon" />
        <span>Please arrive 10–15 minutes before your appointment.</span>
      </div>

      {/* Print Action Button (Hidden on Print) */}
      {showPrintBtn && (
        <div className="appointment-slip-actions no-print">
          <Button variant="primary" className="btn-print-slip" onClick={handlePrint}>
            <Printer size={18} style={{ marginRight: "8px" }} />
            Print Appointment
          </Button>
        </div>
      )}
    </div>
  );
}

export default AppointmentSlip;
