import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  ClipboardList,
  Building2,
  FileText,
  CreditCard,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { getAppointments, updateAppointmentStatus, getPatients, getDoctors } from "../utils/storage";
import "./AdminDashboard.css";
import "./AdminShared.css";
import "./AdminAppointmentDetails.css";

// Reusable Type-Safe String Normalization Helpers
const safeStr = (val) => (val === null || val === undefined ? "" : String(val)).trim();
const toLowerStr = (val) => safeStr(val).toLowerCase();

function AdminAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);

  useEffect(() => {
    const allAppts = getAppointments();
    const targetId = toLowerStr(id);
    const found = allAppts.find(a => toLowerStr(a.id) === targetId);

    if (found) {
      setAppointment(found);

      // Find matching patient record safely
      const allPatients = getPatients();
      const pName = toLowerStr(found.patientName || found.patient);
      const pId = toLowerStr(found.patientId);

      const matchingPatient = allPatients.find(p => {
        const pRecordId = toLowerStr(p.id);
        const pRecordName = toLowerStr(p.name);
        return (
          (pId !== "" && pRecordId !== "" && pRecordId === pId) ||
          (pName !== "" && pRecordName !== "" && pRecordName === pName)
        );
      });
      setPatientDetails(matchingPatient || null);

      // Find matching doctor record safely
      const allDoctors = getDoctors();
      const rawDName = toLowerStr(found.doctorName || found.doctor);
      const cleanDName = rawDName.replace(/^dr\.\s*/, "");
      const dId = toLowerStr(found.doctorId);

      const matchingDoctor = allDoctors.find(d => {
        const dRecordId = toLowerStr(d.id);
        const dRecordName = toLowerStr(d.name).replace(/^dr\.\s*/, "");
        return (
          (dId !== "" && dRecordId !== "" && dRecordId === dId) ||
          (cleanDName !== "" && dRecordName !== "" && (dRecordName.includes(cleanDName) || cleanDName.includes(dRecordName)))
        );
      });
      setDoctorDetails(matchingDoctor || null);
    } else {
      setAppointment(null);
    }
  }, [id]);

  const handleStatusChange = (newStatus) => {
    if (appointment) {
      updateAppointmentStatus(appointment.id, newStatus);
      setAppointment({ ...appointment, status: newStatus });
    }
  };

  // Clean date formatter
  const formatDate = (dateStr) => {
    const dStr = safeStr(dateStr);
    if (!dStr) return "N/A";
    try {
      const parts = dStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        }
      }
    } catch (e) {}
    return dStr;
  };

  if (!appointment) {
    return (
      <div className="patient-dashboard-content">
        <PageHeader
          title="Appointment Details"
          subtitle="Appointment record not found"
          actionLabel="Back to List"
          onAction={() => navigate("/admin/appointments")}
        />
        <div className="admin-details-outer-card" style={{ marginTop: "24px", textAlign: "center", padding: "48px 24px" }}>
          <AlertCircle size={48} style={{ color: "#ef4444", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-heading)", marginBottom: "8px" }}>
            Appointment "{safeStr(id)}" Not Found
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
            The requested appointment record does not exist or was removed.
          </p>
          <Button variant="primary" onClick={() => navigate("/admin/appointments")}>
            Return to Appointments List
          </Button>
        </div>
      </div>
    );
  }

  // Derived patient fields
  const rawPatientName = safeStr(appointment.patientName || appointment.patient || (patientDetails ? patientDetails.name : ""));
  const patientName = rawPatientName !== "" ? rawPatientName : "N/A";

  const rawPatientId = safeStr(appointment.patientId || (patientDetails ? patientDetails.id : ""));
  const patientId = rawPatientId !== "" ? rawPatientId : "N/A";

  const patientContact = patientDetails ? safeStr(patientDetails.contact || patientDetails.phone) : safeStr(appointment.contact || appointment.phone);

  const patientAge = patientDetails ? patientDetails.age : appointment.age;
  const patientGender = patientDetails ? patientDetails.gender : appointment.gender;
  const patientAgeGender = (patientAge || patientGender)
    ? `${patientAge ? `${patientAge} yrs` : ""}${patientAge && patientGender ? ", " : ""}${patientGender || ""}`
    : null;

  // Derived doctor fields
  const rawDoctorName = safeStr(appointment.doctorName || appointment.doctor || (doctorDetails ? doctorDetails.name : ""));
  const doctorName = rawDoctorName !== ""
    ? (toLowerStr(rawDoctorName).startsWith("dr.") ? rawDoctorName : `Dr. ${rawDoctorName}`)
    : "N/A";

  const rawDoctorId = safeStr(appointment.doctorId || (doctorDetails ? doctorDetails.id : ""));
  const doctorId = rawDoctorId !== "" ? rawDoctorId : "N/A";

  const rawSpecialty = safeStr(appointment.specialty || appointment.type || (doctorDetails ? doctorDetails.specialization : ""));
  const specialty = rawSpecialty !== "" ? rawSpecialty : "N/A";

  const rawHospital = safeStr(appointment.hospitalName || appointment.hospital || (doctorDetails ? doctorDetails.hospital : ""));
  const hospitalName = rawHospital !== "" ? rawHospital : "N/A";

  const feeValue = appointment.fee ?? (doctorDetails ? doctorDetails.fee : null);

  return (
    <div className="patient-dashboard-content">
      {/* Top Header */}
      <PageHeader
        title={`Appointment Details: ${appointment.id}`}
        subtitle="Detailed read-only view and status management for administrative records"
        actionLabel="Back to List"
        onAction={() => navigate("/admin/appointments")}
      />

      <div className="admin-details-wrapper">
        <div className="admin-details-outer-card">
          {/* Top Banner inside Outer Card */}
          <div className="admin-details-top-banner">
            <div className="admin-details-id-group">
              <span className="admin-details-id-label">APPOINTMENT REFERENCE ID</span>
              <span className="admin-details-id-value">{appointment.id}</span>
            </div>
            <div className="admin-details-status-control">
              <StatusBadge status={appointment.status || "Upcoming"} />
              <select
                className="admin-status-select"
                value={appointment.status || "Upcoming"}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Balanced 2-Column Grid */}
          <div className="admin-details-grid">
            {/* LEFT COLUMN */}
            <div className="admin-details-column">
              {/* 1. Booking Information */}
              <div className="admin-info-card">
                <div className="admin-info-card-header">
                  <h4 className="admin-info-card-title">
                    <ClipboardList size={18} /> Booking Information
                  </h4>
                </div>
                <div className="admin-info-list">
                  <div className="admin-info-row">
                    <span className="admin-info-label">Appointment ID</span>
                    <span className="admin-info-val" style={{ color: "var(--primary)", fontFamily: "monospace" }}>
                      {appointment.id}
                    </span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Current Status</span>
                    <span className="admin-info-val">
                      <StatusBadge status={appointment.status || "Upcoming"} />
                    </span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Consultation Type</span>
                    <span className="admin-info-val">{appointment.type || appointment.specialty || "General Consultation"}</span>
                  </div>
                </div>
              </div>

              {/* 2. Patient Information */}
              <div className="admin-info-card">
                <div className="admin-info-card-header">
                  <h4 className="admin-info-card-title">
                    <User size={18} /> Patient Information
                  </h4>
                </div>
                <div className="admin-info-list">
                  <div className="admin-info-row">
                    <span className="admin-info-label">Full Name</span>
                    <span className="admin-info-val">{patientName}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Patient ID</span>
                    <span className="admin-info-val">{patientId}</span>
                  </div>
                  {patientContact !== "" && (
                    <div className="admin-info-row">
                      <span className="admin-info-label">Contact Phone</span>
                      <span className="admin-info-val">{patientContact}</span>
                    </div>
                  )}
                  {patientAgeGender && (
                    <div className="admin-info-row">
                      <span className="admin-info-label">Age & Gender</span>
                      <span className="admin-info-val">{patientAgeGender}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Doctor Information */}
              <div className="admin-info-card">
                <div className="admin-info-card-header">
                  <h4 className="admin-info-card-title">
                    <Stethoscope size={18} /> Doctor Information
                  </h4>
                </div>
                <div className="admin-info-list">
                  <div className="admin-info-row">
                    <span className="admin-info-label">Doctor Name</span>
                    <span className="admin-info-val">{doctorName}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Specialization</span>
                    <span className="admin-info-val">{specialty}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Doctor ID</span>
                    <span className="admin-info-val">{doctorId}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Hospital / Facility</span>
                    <span className="admin-info-val">{hospitalName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="admin-details-column">
              {/* 1. Appointment Specifics */}
              <div className="admin-info-card">
                <div className="admin-info-card-header">
                  <h4 className="admin-info-card-title" style={{ color: "var(--text-heading)" }}>
                    <Calendar size={18} /> Appointment Specifics
                  </h4>
                </div>
                <div className="admin-specifics-grid">
                  <div className="admin-specifics-item">
                    <span className="admin-specifics-label">Scheduled Date</span>
                    <span className="admin-specifics-val">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="admin-specifics-item">
                    <span className="admin-specifics-label">Scheduled Time</span>
                    <span className="admin-specifics-val">{appointment.time || "10:00 AM"}</span>
                  </div>
                  <div className="admin-specifics-item">
                    <span className="admin-specifics-label">Consultation Category</span>
                    <span className="admin-specifics-val">{appointment.type || appointment.specialty || "Consultation"}</span>
                  </div>
                  <div className="admin-specifics-item">
                    <span className="admin-specifics-label">Facility Center</span>
                    <span className="admin-specifics-val">{hospitalName}</span>
                  </div>
                </div>
              </div>

              {/* 2. Additional Appointment Info */}
              <div className="admin-info-card">
                <div className="admin-info-card-header">
                  <h4 className="admin-info-card-title" style={{ color: "var(--text-heading)" }}>
                    <FileText size={18} /> Additional Appointment Details
                  </h4>
                </div>
                <div className="admin-info-list">
                  <div className="admin-info-row">
                    <span className="admin-info-label">Consultation Fee</span>
                    <span className="admin-info-val">
                      {feeValue ? `₹${feeValue}` : "N/A"}
                    </span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Payment Status</span>
                    <span className="admin-info-val" style={{ color: "var(--success)" }}>
                      {appointment.paymentStatus || "Paid / Confirmed"}
                    </span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Booking Channel</span>
                    <span className="admin-info-val">MediBook Online Portal</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Clinical Notes / Reason</span>
                    <span className="admin-info-val" style={{ fontWeight: "400", color: "var(--text-muted)" }}>
                      {appointment.notes || appointment.reason || "Routine Consultation"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAppointmentDetails;
