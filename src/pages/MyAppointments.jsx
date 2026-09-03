import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Eye,
  X,
  AlertTriangle,
  Receipt,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getDoctors, getCurrentPatient, getCurrentUser, getPatientAppointments, addNotification } from "../utils/storage";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import AppointmentCard from "../components/AppointmentCard";
import EmptyState from "../components/EmptyState";
import "./MyAppointments.css";

import { useAppointments } from "../context/AppointmentContext";

function MyAppointments() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment } = useAppointments();
  const [activeTab, setActiveTab] = useState("Upcoming");

  // API State
  const [apiAppointments, setApiAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Fetch Appointments from ASP.NET Core backend (GET /api/Appointments)
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://localhost:7050/api/Appointments");
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      setApiAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading appointments from backend:", err);
      setError("Unable to connect to backend server. Please check if the ASP.NET Core API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Helper to format backend time strings (e.g. "10:30:00" -> "10:30 AM")
  const formatBackendTime = (timeStr) => {
    if (!timeStr) return "10:30 AM";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hh = String(hours).padStart(2, "0");
      return `${hh}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  // Map backend response fields to frontend contract
  const normalizeApiAppointment = (apt) => {
    const rawDate = apt.appointmentDate ? String(apt.appointmentDate).split("T")[0] : "";
    const displayTime = formatBackendTime(apt.appointmentTime);

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName || "Patient",
      doctorId: apt.doctorId,
      doctorName: apt.doctorName || "Doctor",
      hospitalId: apt.hospitalId,
      hospitalName: apt.hospitalName || "MediCare Hospital",
      hospital: apt.hospitalName || "MediCare Hospital",
      appointmentDate: apt.appointmentDate,
      date: rawDate,
      time: displayTime,
      appointmentTime: apt.appointmentTime,
      status: apt.status || "Pending",
      appointmentType: apt.appointmentType || "Consultation",
      specialty: apt.appointmentType || "Consultation",
      reason: apt.reason || "Regular consultation",
      consultationFee: apt.consultationFee ?? 500,
      fee: apt.consultationFee ?? 500,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    };
  };

  // Dynamically filter appointments belonging to currently logged-in patient
  const patientAppts = useMemo(() => {
    const p = getCurrentPatient();
    const u = getCurrentUser();

    // Use backend API data if available, otherwise fallback to context
    const sourceList = apiAppointments.length > 0 ? apiAppointments.map(normalizeApiAppointment) : appointments;

    const pIdInt = parseInt(String(p?.id || p?.patientId || u?.refId || u?.id || "").replace(/\D/g, ""), 10);
    const pNameStr = String(p?.name || u?.name || "").trim().toLowerCase();

    return sourceList.filter((apt) => {
      const aptPIdInt = parseInt(String(apt.patientId || "").replace(/\D/g, ""), 10);
      const aptPNameStr = String(apt.patientName || "").trim().toLowerCase();

      // 1. Direct numeric patient ID match
      if (pIdInt && aptPIdInt && pIdInt === aptPIdInt) return true;

      // 2. Patient Name match
      if (pNameStr && aptPNameStr && (pNameStr === aptPNameStr || pNameStr.includes(aptPNameStr) || aptPNameStr.includes(pNameStr))) return true;

      // 3. Fallback for default patient ID 1 / P1
      if ((!pIdInt || pIdInt === 1) && (!aptPIdInt || aptPIdInt === 1)) return true;

      return false;
    });
  }, [apiAppointments, appointments]);

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Helper to resolve Doctor information
  const getDoctorInfo = (appt) => {
    if (!appt) return { name: "N/A", specialty: "N/A", hospital: "N/A", location: "", fee: "N/A", initials: "DR" };
    let doc = null;
    const doctorsList = getDoctors();
    const docIdStr = String(appt.doctorId ?? "").trim();
    const docNameStr = String(appt.doctorName || appt.doctor || "").trim();

    if (docIdStr !== "") {
      doc = doctorsList.find((d) => String(d.id ?? "").trim() === docIdStr);
    }
    if (!doc && docNameStr !== "") {
      const normTargetDocName = docNameStr.toLowerCase();
      doc = doctorsList.find((d) => String(d.name ?? "").trim().toLowerCase() === normTargetDocName);
    }

    const rawName = appt.doctorName || appt.doctor || doc?.name;
    const name = String(rawName ?? "").trim() !== "" ? String(rawName).trim() : "N/A";

    const rawSpec = appt.specialty || appt.type || doc?.specialty || doc?.specialization;
    const specialty = String(rawSpec ?? "").trim() !== "" ? String(rawSpec).trim() : "N/A";

    const rawHosp = appt.hospital || appt.hospitalName || doc?.hospital || doc?.hospitalName;
    const hospital = String(rawHosp ?? "").trim() !== "" ? String(rawHosp).trim() : "N/A";

    const rawLoc = appt.location || doc?.location;
    const location = String(rawLoc ?? "").trim() !== "" ? String(rawLoc).trim() : "";

    const feeVal = appt.consultationFee ?? appt.fee ?? doc?.consultationFee ?? doc?.fee;
    const fee = feeVal !== null && feeVal !== undefined ? feeVal : "N/A";

    // Doctor Initials
    const initials = name !== "N/A"
      ? name
          .split(" ")
          .filter((n) => String(n ?? "").toLowerCase() !== "dr.")
          .map((n) => (n && n[0] ? n[0] : ""))
          .join("")
          .substring(0, 2)
          .toUpperCase() || "DR"
      : "DR";

    return { name, specialty, hospital, location, fee, initials };
  };

  // Normalization helper for appointment status
  const getNormalizedStatus = (status) => {
    if (!status) return "upcoming";
    const s = String(status).toLowerCase().trim();
    if (s === "upcoming" || s === "confirmed" || s === "pending" || s === "scheduled") return "upcoming";
    if (s === "completed") return "completed";
    if (s === "cancelled") return "cancelled";
    return "upcoming";
  };

  // Dynamic tab counts for current patient
  const tabCounts = useMemo(() => {
    const counts = { Upcoming: 0, Completed: 0, Cancelled: 0 };
    patientAppts.forEach((appt) => {
      const norm = getNormalizedStatus(appt.status);
      if (norm === "upcoming") counts.Upcoming++;
      else if (norm === "completed") counts.Completed++;
      else if (norm === "cancelled") counts.Cancelled++;
    });
    return counts;
  }, [patientAppts]);

  // Filtered appointments for active tab
  const filteredAppointments = useMemo(() => {
    return patientAppts.filter((appt) => {
      const norm = getNormalizedStatus(appt.status);
      return norm === activeTab.toLowerCase();
    });
  }, [patientAppts, activeTab]);

  // Handle View Action
  const handleViewAppointment = (appt) => {
    navigate(`/appointments/${appt.id}`);
  };

  // Handle Initiate Cancel Action
  const handleInitiateCancel = (appt) => {
    setAppointmentToCancel(appt);
    setShowCancelModal(true);
  };

  // Handle Confirm Cancel
  const handleConfirmCancel = () => {
    if (!appointmentToCancel) return;

    setApiAppointments((prev) =>
      prev.map((a) => (String(a.id) === String(appointmentToCancel.id) ? { ...a, status: "Cancelled" } : a))
    );

    cancelAppointment(appointmentToCancel.id);
    setShowCancelModal(false);

    const docName = appointmentToCancel.doctorName || appointmentToCancel.doctor || "the doctor";
    const pId = appointmentToCancel.patientId || getCurrentPatient()?.id || getCurrentUser()?.refId || getCurrentUser()?.id || "P1";
    const uId = getCurrentUser()?.id || "U_P1";

    addNotification({
      type: "appointment",
      subType: "cancelled",
      title: "Appointment Cancelled",
      message: `Your appointment with ${docName} has been cancelled.`,
      appointmentId: appointmentToCancel.id,
      patientId: pId,
      userId: uId
    });

    setAppointmentToCancel(null);

    showNotification(
      "Appointment Cancelled",
      "Your appointment has been successfully cancelled.",
      "error"
    );
  };

  // Readable date formatter
  const formatDisplayDate = (dateStr, formattedDate) => {
    if (formattedDate) return formattedDate;
    if (!dateStr) return "August 26, 2026";
    try {
      const [y, m, d] = dateStr.split("-");
      if (y && m && d) {
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        return dateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div className="my-appointments-page">
      {/* Page Header */}
      <PageHeader
        title="My Appointments"
        subtitle="View and manage your upcoming, completed, and cancelled appointments."
      />

      {/* Tabs */}
      <div className="my-appointments-tabs">
        <button
          className={`tab-button ${activeTab === "Upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("Upcoming")}
        >
          <span>Upcoming</span>
          <span className="tab-count-badge">{tabCounts.Upcoming}</span>
        </button>

        <button
          className={`tab-button ${activeTab === "Completed" ? "active" : ""}`}
          onClick={() => setActiveTab("Completed")}
        >
          <span>Completed</span>
          <span className="tab-count-badge">{tabCounts.Completed}</span>
        </button>

        <button
          className={`tab-button ${activeTab === "Cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("Cancelled")}
        >
          <span>Cancelled</span>
          <span className="tab-count-badge">{tabCounts.Cancelled}</span>
        </button>
      </div>

      {/* Appointments List with Loading & Error States */}
      <div className="my-appointments-list">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-muted)", margin: 0 }}>
              Loading your appointments...
            </p>
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load appointments"
            description={error}
            icon={AlertCircle}
            actionLabel="Try Again"
            onAction={fetchAppointments}
          />
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appt) => {
            const statusNorm = getNormalizedStatus(appt.status);

            return (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onView={handleViewAppointment}
                onCancel={statusNorm === "upcoming" ? handleInitiateCancel : undefined}
              />
            );
          })
        ) : (
          /* Reusable Empty State */
          <EmptyState
            title={
              activeTab === "Upcoming"
                ? "No upcoming appointments"
                : activeTab === "Completed"
                ? "No completed appointments"
                : "No cancelled appointments"
            }
            description={
              activeTab === "Upcoming"
                ? "You don't have any upcoming appointments yet."
                : activeTab === "Completed"
                ? "Your completed appointments will appear here."
                : "You don't have any cancelled appointments."
            }
            icon={
              activeTab === "Upcoming"
                ? Clock3
                : activeTab === "Completed"
                ? CheckCircle2
                : XCircle
            }
            actionLabel={activeTab === "Upcoming" ? "Find a Doctor" : undefined}
            onAction={activeTab === "Upcoming" ? () => navigate("/find-doctor") : undefined}
          />
        )}
      </div>

      {/* 1. View Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Appointment Details"
          footer={
            <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          }
        >
          {(() => {
            const docInfo = getDoctorInfo(selectedAppointment);
            const statusNorm = getNormalizedStatus(selectedAppointment.status);
            const displayDate = formatDisplayDate(
              selectedAppointment.date,
              selectedAppointment.formattedDate
            );

            return (
              <div className="modal-detail-content">
                <div className="modal-doc-summary">
                  <div className="doc-avatar-circle">{docInfo.initials}</div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        fontFamily: "var(--font-heading)",
                        color: "var(--text-heading)"
                      }}
                    >
                      {docInfo.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "13.5px",
                        color: "var(--primary)",
                        fontWeight: 600
                      }}
                    >
                      {docInfo.specialty}
                    </span>
                  </div>
                </div>

                <div className="modal-details-grid">
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Hospital</span>
                    <strong className="modal-detail-value">{docInfo.hospital}</strong>
                  </div>

                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Location</span>
                    <strong className="modal-detail-value">{docInfo.location}</strong>
                  </div>

                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Date</span>
                    <strong className="modal-detail-value">{displayDate}</strong>
                  </div>

                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Time</span>
                    <strong className="modal-detail-value">
                      {selectedAppointment.time || "10:30 AM"}
                    </strong>
                  </div>

                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Consultation Fee</span>
                    <strong className="modal-detail-value">₹{docInfo.fee}</strong>
                  </div>

                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Status</span>
                    <div>
                      <span className={`status-badge-capsule ${statusNorm}`}>
                        {statusNorm === "upcoming" ? "Confirmed" : statusNorm}
                      </span>
                    </div>
                  </div>

                  <div className="modal-detail-row full-width">
                    <span className="modal-detail-label">Appointment ID</span>
                    <strong
                      className="modal-detail-value"
                      style={{
                        fontFamily: "monospace",
                        color: "var(--primary)",
                        letterSpacing: "0.5px"
                      }}
                    >
                      {selectedAppointment.id}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* 2. Cancel Confirmation Modal */}
      {appointmentToCancel && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Appointment?"
        >
          {(() => {
            const docInfo = getDoctorInfo(appointmentToCancel);
            const displayDate = formatDisplayDate(
              appointmentToCancel.date,
              appointmentToCancel.formattedDate
            );

            return (
              <div className="cancel-modal-body">
                <div className="cancel-warning-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                    <AlertTriangle size={18} />
                    <span>Are you sure you want to cancel this appointment?</span>
                  </div>
                </div>

                <div className="cancel-appt-summary">
                  <div>
                    <strong>Doctor:</strong> {docInfo.name}
                  </div>
                  <div>
                    <strong>Specialization:</strong> {docInfo.specialty}
                  </div>
                  <div>
                    <strong>Date & Time:</strong> {displayDate} at {appointmentToCancel.time || "10:30 AM"}
                  </div>
                </div>

                <div className="cancel-actions-row">
                  <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                    Keep Appointment
                  </Button>

                  <Button
                    variant="primary"
                    className="btn-destructive"
                    onClick={handleConfirmCancel}
                  >
                    Cancel Appointment
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Toast Overlay */}
      {toast.show && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}
    </div>
  );
}

export default MyAppointments;