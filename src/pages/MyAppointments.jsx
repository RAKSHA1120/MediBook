import { useState, useMemo } from "react";
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
  Receipt
} from "lucide-react";
import doctors from "../data/doctors";
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

  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Helper to resolve Doctor information
  const getDoctorInfo = (appt) => {
    let doc = null;
    if (appt.doctorId) {
      doc = doctors.find((d) => String(d.id) === String(appt.doctorId));
    }
    if (!doc && appt.doctorName) {
      doc = doctors.find((d) => d.name.toLowerCase() === appt.doctorName.toLowerCase());
    }

    const name = appt.doctorName || doc?.name || "Dr. Emily Carter";
    const specialty = appt.specialty || doc?.specialty || "Cardiology";
    const hospital = appt.hospital || doc?.hospital || "MediCare Hospital";
    const location = appt.location || doc?.location || "Chennai";
    const fee = appt.consultationFee ?? doc?.consultationFee ?? 800;

    // Doctor Initials
    const initials = name
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "DR";

    return { name, specialty, hospital, location, fee, initials };
  };

  // Normalization helper for appointment status
  const getNormalizedStatus = (status) => {
    if (!status) return "upcoming";
    const s = String(status).toLowerCase();
    if (s === "upcoming" || s === "confirmed") return "upcoming";
    if (s === "completed") return "completed";
    if (s === "cancelled") return "cancelled";
    return "upcoming";
  };

  // Dynamic tab counts
  const tabCounts = useMemo(() => {
    const counts = { Upcoming: 0, Completed: 0, Cancelled: 0 };
    appointments.forEach((appt) => {
      const norm = getNormalizedStatus(appt.status);
      if (norm === "upcoming") counts.Upcoming++;
      else if (norm === "completed") counts.Completed++;
      else if (norm === "cancelled") counts.Cancelled++;
    });
    return counts;
  }, [appointments]);

  // Filtered appointments for active tab
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const norm = getNormalizedStatus(appt.status);
      return norm === activeTab.toLowerCase();
    });
  }, [appointments, activeTab]);

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

    cancelAppointment(appointmentToCancel.id);
    setShowCancelModal(false);
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

      {/* Appointments List */}
      <div className="my-appointments-list">
        {filteredAppointments.length > 0 ? (
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
            onAction={activeTab === "Upcoming" ? () => navigate("/doctors") : undefined}
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