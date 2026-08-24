import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Receipt,
  CheckCircle2,
  XCircle,
  Star,
  Briefcase,
  AlertTriangle,
  Sunrise,
  Sun,
  Sunset,
  CalendarDays
} from "lucide-react";
import doctors from "../data/doctors";
import { TIME_SLOTS, getMockBookedAppointments, getMockDisabledAppointments } from "../data/appointments";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import DateSelector from "../components/DateSelector";
import TimeSlot, { TimeSlotGroup } from "../components/TimeSlot";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { addNotification } from "../data/notifications";
import { useAppointments } from "../context/AppointmentContext";
import "./AppointmentDetails.css";

function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, cancelAppointment, rescheduleAppointment, isSlotBooked } = useAppointments();

  // Find target appointment
  const currentAppt = useMemo(() => {
    return appointments.find((a) => String(a.id) === String(id));
  }, [appointments, id]);

  // Reschedule UI States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newSelectedDate, setNewSelectedDate] = useState("");
  const [newSelectedSlot, setNewSelectedSlot] = useState("");
  const [showRescheduleConfirmModal, setShowRescheduleConfirmModal] = useState(false);

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };



  // Helper to resolve Doctor Information
  const getDoctorInfo = (appt) => {
    if (!appt) return null;
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
    const experience = doc?.experience ?? 12;
    const rating = doc?.rating ?? 4.8;
    const reviewCount = doc?.reviewCount ?? 124;

    const initials = name
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "DR";

    return { docObj: doc, name, specialty, hospital, location, fee, experience, rating, reviewCount, initials };
  };

  // Normalization helper for status
  const getNormalizedStatus = (status) => {
    if (!status) return "upcoming";
    const s = String(status).toLowerCase();
    if (s === "upcoming" || s === "confirmed") return "upcoming";
    if (s === "completed") return "completed";
    if (s === "cancelled") return "cancelled";
    return "upcoming";
  };

  // Date formatter
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

  // Generate 14 upcoming dates for DateSelector
  const upcomingDates = useMemo(() => {
    const list = [];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const dayName = daysOfWeek[d.getDay()];
      const dayNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateString = `${yyyy}-${mm}-${dd}`;

      list.push({
        dateString,
        dayName,
        dayNum,
        monthName,
        year
      });
    }
    return list;
  }, []);

  const docInfo = getDoctorInfo(currentAppt);
  const bookedSlotsMap = useMemo(() => {
    return getMockBookedAppointments(docInfo?.docObj?.id || 1);
  }, [docInfo?.docObj?.id]);

  const disabledSlotsMap = useMemo(() => {
    return getMockDisabledAppointments(docInfo?.docObj?.id || 1);
  }, [docInfo?.docObj?.id]);

  const isDateBooked = (dateString) => {
    const dateObj = upcomingDates.find((d) => d.dateString === dateString);
    if (!dateObj) return true;

    const workingDays = docInfo?.docObj?.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const isWorkingDay = workingDays.some(
      (day) =>
        day.toLowerCase() === dateObj.dayName.toLowerCase() ||
        dateObj.dayName.toLowerCase().startsWith(day.toLowerCase().slice(0, 3))
    );
    if (!isWorkingDay) return true;

    const bookedForDate = bookedSlotsMap[dateString] || [];
    const totalSlotsCount =
      (TIME_SLOTS?.Morning?.length || 0) +
      (TIME_SLOTS?.Afternoon?.length || 0) +
      (TIME_SLOTS?.Evening?.length || 0);

    return bookedForDate.length >= totalSlotsCount;
  };

  const currentBookedSlots = useMemo(() => {
    if (!newSelectedDate) return [];
    return bookedSlotsMap[newSelectedDate] || [];
  }, [newSelectedDate, bookedSlotsMap]);

  const currentDisabledSlots = useMemo(() => {
    if (!newSelectedDate) return [];
    return disabledSlotsMap[newSelectedDate] || [];
  }, [newSelectedDate, disabledSlotsMap]);

  // If appointment not found, show clean Error state
  if (!currentAppt) {
    return (
      <div className="appointment-details-page">
        <div className="details-not-found-card">
          <div className="not-found-icon-wrap">
            <XCircle size={36} />
          </div>
          <h2 className="not-found-title">Appointment Not Found</h2>
          <p className="not-found-desc">
            The appointment you're looking for could not be found or may have been removed.
          </p>
          <Button variant="primary" onClick={() => navigate("/my-appointments")}>
            <ArrowLeft size={16} style={{ marginRight: "6px" }} />
            Back to My Appointments
          </Button>
        </div>
      </div>
    );
  }

  const statusNorm = getNormalizedStatus(currentAppt.status);
  const displayDate = formatDisplayDate(currentAppt.date, currentAppt.formattedDate);

  // Reschedule Handlers
  const handleStartReschedule = () => {
    setNewSelectedDate(currentAppt.date || upcomingDates[0]?.dateString || "");
    setNewSelectedSlot(currentAppt.time || "10:30 AM");
    setIsRescheduling(true);
  };

  const handleConfirmRescheduleSubmit = () => {
    if (!newSelectedDate || !newSelectedSlot) return;

    // Create formatted readable date
    let formattedNewDate = newSelectedDate;
    try {
      const [y, m, d] = newSelectedDate.split("-");
      if (y && m && d) {
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        formattedNewDate = dateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch (e) {}

    const result = rescheduleAppointment(currentAppt.id, newSelectedDate, newSelectedSlot, formattedNewDate);
    if (!result.success) {
      showNotification("Reschedule Failed", result.message, "error");
      return;
    }

    setShowRescheduleConfirmModal(false);
    setIsRescheduling(false);

    addNotification({
      type: "appointment",
      subType: "rescheduled",
      title: "Appointment Rescheduled",
      message: `Your appointment with ${docInfo.name} has been rescheduled to ${formattedNewDate} at ${newSelectedSlot}.`,
      appointmentId: currentAppt.id
    });

    showNotification(
      "Appointment Rescheduled",
      `Your appointment has been rescheduled to ${formattedNewDate} at ${newSelectedSlot}.`,
      "success"
    );
  };

  // Cancel Handlers
  const handleConfirmCancelSubmit = () => {
    cancelAppointment(currentAppt.id);
    setShowCancelModal(false);

    addNotification({
      type: "appointment",
      subType: "cancelled",
      title: "Appointment Cancelled",
      message: `Your appointment with ${docInfo.name} on ${displayDate} has been cancelled.`,
      appointmentId: currentAppt.id
    });

    showNotification(
      "Appointment Cancelled",
      "Your appointment has been successfully cancelled.",
      "error"
    );
  };

  return (
    <div className="appointment-details-page">
      {/* Page Header Component */}
      <PageHeader
        title="Appointment Details"
        subtitle="View and manage your appointment details."
        onBack={() => navigate("/my-appointments")}
        backLabel="Back to My Appointments"
      />

      {!isRescheduling ? (
        /* Main View Record Card */
        <div className="details-main-card">
          {/* Status Header */}
          <div className="details-status-row">
            <div className="appt-id-badge">
              <span className="appt-id-label">Appointment ID</span>
              <span className="appt-id-value">{currentAppt.id}</span>
            </div>

            <StatusBadge status={currentAppt.status} />
          </div>

          {/* Doctor Information Card */}
          <div className="details-doctor-section">
            <div className="details-doc-avatar">{docInfo.initials}</div>
            <div className="details-doc-info">
              <h2 className="details-doc-name">{docInfo.name}</h2>
              <span className="details-doc-specialty">{docInfo.specialty}</span>
              <div className="details-doc-meta">
                <span className="meta-item">
                  <Building2 size={14} />
                  {docInfo.hospital}
                </span>
                <span className="meta-item">
                  <MapPin size={14} />
                  {docInfo.location}
                </span>
                <span className="meta-item">
                  <Briefcase size={14} />
                  {docInfo.experience} years exp.
                </span>
                <span className="meta-item">
                  <Star size={14} className="rating-star-icon" />
                  <strong>{docInfo.rating}</strong> ({docInfo.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Summary Section */}
          <div className="details-summary-section">
            <h3 className="summary-section-title">Appointment Summary</h3>

            <div className="details-summary-grid">
              <div className="summary-card-item">
                <div className="summary-icon-wrapper">
                  <Calendar size={20} />
                </div>
                <div className="summary-item-content">
                  <span className="summary-item-label">Date</span>
                  <span className="summary-item-value">{displayDate}</span>
                </div>
              </div>

              <div className="summary-card-item">
                <div className="summary-icon-wrapper">
                  <Clock size={20} />
                </div>
                <div className="summary-item-content">
                  <span className="summary-item-label">Time</span>
                  <span className="summary-item-value">{currentAppt.time || "10:30 AM"}</span>
                </div>
              </div>

              <div className="summary-card-item">
                <div className="summary-icon-wrapper">
                  <Receipt size={20} />
                </div>
                <div className="summary-item-content">
                  <span className="summary-item-label">Consultation Fee</span>
                  <span className="summary-item-value">₹{docInfo.fee}</span>
                </div>
              </div>

              <div className="summary-card-item">
                <div className="summary-icon-wrapper">
                  <Building2 size={20} />
                </div>
                <div className="summary-item-content">
                  <span className="summary-item-label">Hospital</span>
                  <span className="summary-item-value">{docInfo.hospital}</span>
                </div>
              </div>

              <div className="summary-card-item">
                <div className="summary-icon-wrapper">
                  <MapPin size={20} />
                </div>
                <div className="summary-item-content">
                  <span className="summary-item-label">Location</span>
                  <span className="summary-item-value">{docInfo.location}</span>
                </div>
              </div>

              <div className="summary-card-item">
                <div className="summary-icon-wrapper">
                  <CheckCircle2 size={20} />
                </div>
                <div className="summary-item-content">
                  <span className="summary-item-label">Status</span>
                  <span className="summary-item-value" style={{ textTransform: "capitalize" }}>
                    {statusNorm === "upcoming" ? "Confirmed" : statusNorm}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="details-actions-container">
            {statusNorm === "upcoming" ? (
              <>
                <Button
                  variant="primary"
                  className="btn-action-reschedule"
                  onClick={handleStartReschedule}
                >
                  <CalendarDays size={16} style={{ marginRight: "6px" }} />
                  Reschedule Appointment
                </Button>

                <Button
                  variant="outline"
                  className="btn-action-cancel"
                  onClick={() => setShowCancelModal(true)}
                >
                  <XCircle size={16} style={{ marginRight: "6px" }} />
                  Cancel Appointment
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/my-appointments")}>
                <ArrowLeft size={16} style={{ marginRight: "6px" }} />
                Back to My Appointments
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Reschedule Appointment Interface */
        <div className="reschedule-panel">
          <div className="reschedule-header">
            <h2 className="reschedule-title">Reschedule Appointment</h2>
            <button className="btn-back-link" onClick={() => setIsRescheduling(false)}>
              Cancel & Go Back
            </button>
          </div>

          {/* Current Appointment Banner */}
          <div className="current-appt-banner">
            <div className="banner-left">
              <span className="banner-label">Current Scheduled Appointment</span>
              <span className="banner-info">
                {docInfo.name} • {displayDate} at {currentAppt.time || "10:30 AM"}
              </span>
            </div>
          </div>

          {/* Date Selector */}
          <div className="reschedule-section-block">
            <h3 className="section-label-heading">Select New Date</h3>
            <DateSelector
              dates={upcomingDates}
              selectedDate={newSelectedDate}
              onDateSelect={(dateStr) => {
                setNewSelectedDate(dateStr);
                setNewSelectedSlot("");
              }}
              isDateBooked={isDateBooked}
            />
          </div>

          {/* Time Slot Selector */}
          {newSelectedDate && (
            <div className="reschedule-section-block">
              <h3 className="section-label-heading">Select New Time Slot</h3>

              {/* Morning Slots */}
              {TIME_SLOTS?.Morning && (
                <TimeSlotGroup title="Morning Slots" icon={<Sunrise size={18} />}>
                  {TIME_SLOTS.Morning.map((slot) => {
                    const isBooked = currentBookedSlots.includes(slot);
                    const isDisabled = currentDisabledSlots.includes(slot);
                    const status = isBooked
                      ? "booked"
                      : isDisabled
                      ? "disabled"
                      : slot === newSelectedSlot
                      ? "selected"
                      : "available";

                    return (
                      <TimeSlot
                        key={slot}
                        time={slot}
                        status={status}
                        selected={slot === newSelectedSlot}
                        disabled={isBooked || isDisabled}
                        onClick={() => setNewSelectedSlot(slot)}
                      />
                    );
                  })}
                </TimeSlotGroup>
              )}

              {/* Afternoon Slots */}
              {TIME_SLOTS?.Afternoon && (
                <TimeSlotGroup title="Afternoon Slots" icon={<Sun size={18} />}>
                  {TIME_SLOTS.Afternoon.map((slot) => {
                    const isBooked = currentBookedSlots.includes(slot);
                    const isDisabled = currentDisabledSlots.includes(slot);
                    const status = isBooked
                      ? "booked"
                      : isDisabled
                      ? "disabled"
                      : slot === newSelectedSlot
                      ? "selected"
                      : "available";

                    return (
                      <TimeSlot
                        key={slot}
                        time={slot}
                        status={status}
                        selected={slot === newSelectedSlot}
                        disabled={isBooked || isDisabled}
                        onClick={() => setNewSelectedSlot(slot)}
                      />
                    );
                  })}
                </TimeSlotGroup>
              )}

              {/* Evening Slots */}
              {TIME_SLOTS?.Evening && (
                <TimeSlotGroup title="Evening Slots" icon={<Sunset size={18} />}>
                  {TIME_SLOTS.Evening.map((slot) => {
                    const isBooked = currentBookedSlots.includes(slot);
                    const isDisabled = currentDisabledSlots.includes(slot);
                    const status = isBooked
                      ? "booked"
                      : isDisabled
                      ? "disabled"
                      : slot === newSelectedSlot
                      ? "selected"
                      : "available";

                    return (
                      <TimeSlot
                        key={slot}
                        time={slot}
                        status={status}
                        selected={slot === newSelectedSlot}
                        disabled={isBooked || isDisabled}
                        onClick={() => setNewSelectedSlot(slot)}
                      />
                    );
                  })}
                </TimeSlotGroup>
              )}
            </div>
          )}

          {/* Reschedule Footer */}
          <div className="reschedule-actions-footer">
            <Button variant="outline" onClick={() => setIsRescheduling(false)}>
              Cancel
            </Button>

            <Button
              variant="primary"
              disabled={!newSelectedDate || !newSelectedSlot}
              onClick={() => setShowRescheduleConfirmModal(true)}
            >
              Confirm Reschedule
            </Button>
          </div>
        </div>
      )}

      {/* 1. Reschedule Confirmation Modal */}
      {showRescheduleConfirmModal && (
        <Modal
          isOpen={showRescheduleConfirmModal}
          onClose={() => setShowRescheduleConfirmModal(false)}
          title="Confirm Reschedule?"
        >
          {(() => {
            let formattedNewDate = newSelectedDate;
            try {
              const [y, m, d] = newSelectedDate.split("-");
              if (y && m && d) {
                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                formattedNewDate = dateObj.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                });
              }
            } catch (e) {}

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "var(--font-body)" }}>
                <p style={{ margin: 0, fontSize: "14.5px", color: "var(--text-primary)" }}>
                  Your appointment with <strong>{docInfo.name}</strong> will be updated to:
                </p>

                <div
                  style={{
                    padding: "16px",
                    background: "var(--primary-soft)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--primary-light)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div>
                    <strong>New Date:</strong> {formattedNewDate}
                  </div>
                  <div>
                    <strong>New Time Slot:</strong> {newSelectedSlot}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                  <Button variant="outline" onClick={() => setShowRescheduleConfirmModal(false)}>
                    Go Back
                  </Button>

                  <Button variant="primary" onClick={handleConfirmRescheduleSubmit}>
                    Confirm Reschedule
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* 2. Cancel Confirmation Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Appointment?"
        >
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
                <strong>Date & Time:</strong> {displayDate} at {currentAppt.time || "10:30 AM"}
              </div>
            </div>

            <div className="cancel-actions-row">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Keep Appointment
              </Button>

              <Button variant="primary" className="btn-destructive" onClick={handleConfirmCancelSubmit}>
                Cancel Appointment
              </Button>
            </div>
          </div>
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

export default AppointmentDetails;