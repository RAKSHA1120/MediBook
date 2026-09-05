import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  MapPin,
  Star,
  User,
  Heart,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Building2,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Sunrise,
  Sun
} from "lucide-react";
import {
  TIME_SLOTS,
  getMockBookedAppointments,
  getMockDisabledAppointments
} from "../data/appointments";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import DateSelector from "../components/DateSelector";
import TimeSlot, { TimeSlotGroup } from "../components/TimeSlot";
import BookingSummary from "../components/BookingSummary";
import Toast from "../components/Toast";
import { addNotification } from "../data/notifications";
import { getCurrentUser, getCurrentPatient } from "../utils/auth";

import { api } from "../utils/api";
import "./AppointmentBooking.css";

import { useAppointments } from "../context/AppointmentContext";

// Patient info for Navbar
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

function AppointmentBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSlotBooked, addAppointment } = useAppointments();

  // Sidebar Open State for Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Selected Doctor with robust default fallback
  const doctor = location.state?.doctor || {
    id: 1,
    name: "Dr. Emily Carter",
    specialty: "Cardiology",
    location: "Chennai",
    hospital: "MediCare Hospital",
    experience: 12,
    rating: 4.8,
    reviewCount: 124,
    consultationFee: 800,
    availability: "Available Today",
    gender: "Female",
    qualification: "MBBS, MD, DM",
    availableDays: ["Mon", "Wed", "Fri"]
  };

  // Appointment Selection States
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });
  
  // Loading & Success Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Helper to format time strings (e.g. "10:30 AM", "02:15 PM") to backend HH:mm:ss format
  const formatTimeToHHmmss = (timeStr) => {
    if (!timeStr) return "09:00:00";
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr.trim())) {
      return timeStr.trim();
    }
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return "09:00:00";

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3] ? match[3].toUpperCase() : null;

    if (modifier === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    const hh = String(hours).padStart(2, "0");
    return `${hh}:${minutes}:00`;
  };

  // Generate initials for avatar
  const getInitials = (name = "") => {
    if (!name || typeof name.split !== 'function') return "DR";
    return name
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Proactive toast trigger
  const showNotification = (title, message, type = "success") => {
    setToast({
      show: true,
      type,
      title,
      message
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Generate next 14 days dynamically starting from today
  const dates = useMemo(() => {
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
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
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

  // Get disabled slots map for this doctor
  const disabledSlotsMap = useMemo(() => {
    return getMockDisabledAppointments(doctor?.id || 1);
  }, [doctor?.id]);

  // All time slots list
  const allTimeSlots = useMemo(() => {
    return [
      ...(TIME_SLOTS?.Morning || []),
      ...(TIME_SLOTS?.Afternoon || []),
      ...(TIME_SLOTS?.Evening || [])
    ];
  }, []);

  // Check if a date is booked/unavailable (only if ALL slots for doctor are booked)
  const isDateBooked = (dateString) => {
    const dateObj = dates.find((d) => d.dateString === dateString);
    if (!dateObj) return true;

    // 1. Check if weekday is supported by doctor
    const workingDays = doctor?.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const isWorkingDay = workingDays.some((day) => 
      day.toLowerCase() === dateObj.dayName.toLowerCase() ||
      dateObj.dayName.toLowerCase().startsWith(day.toLowerCase().slice(0, 3))
    );
    if (!isWorkingDay) {
      return true; // Not working -> Booked/Unavailable
    }

    // 2. Check if ALL slots for this date are booked
    const bookedCount = allTimeSlots.reduce((count, slotTime) => {
      return isSlotBooked(doctor.id, dateString, slotTime) ? count + 1 : count;
    }, 0);

    return bookedCount > 0 && bookedCount >= allTimeSlots.length;
  };

  // Get list of disabled slots for the currently selected date
  const currentDisabledSlots = useMemo(() => {
    if (!selectedDate) return [];
    return disabledSlotsMap[selectedDate] || [];
  }, [selectedDate, disabledSlotsMap]);

  // Calculate status for each individual time slot
  const getSlotStatus = (time) => {
    if (selectedSlot === time) return "selected";
    if (isSlotBooked(doctor.id, selectedDate, time)) return "booked";
    if (currentDisabledSlots.includes(time)) return "disabled";
    return "available";
  };

  // Format date for readable display: "Monday, Aug 24, 2026"
  const formatReadableDate = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = dates.find(d => d.dateString === dateStr);
    if (!dateObj) return "";
    return `${dateObj.dayName}, ${dateObj.monthName} ${dateObj.dayNum}, ${dateObj.year}`;
  };

  // Reset selected slot when date changes
  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot("");
  };

  // Handle Confirm Booking by calling ASP.NET Core API (POST /api/Appointments)
  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedSlot || isSubmitting) return;

    // Check frontend slot availability state before calling API
    if (isSlotBooked(doctor.id, selectedDate, selectedSlot)) {
      showNotification(
        "Slot Unavailable",
        "This time slot has already been booked. Please select another slot.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const currUser = getCurrentUser();
      const currPatient = getCurrentPatient();

      // Use the actual integer ID directly from the authentication context (or fallback to 1)
      const rawPatientId = currUser?.refId || currPatient?.id; const patientId = Number(rawPatientId) ? Number(rawPatientId) : 1;
      const doctorId = Number(doctor?.id) ? Number(doctor?.id) : 1;
      const hospitalId = Number(doctor?.hospitalId) ? Number(doctor?.hospitalId) : 1;

      const formattedTime = formatTimeToHHmmss(selectedSlot);
      const feeVal = doctor?.consultationFee ?? doctor?.fee ?? 500;

      const payload = {
        patientId,
        doctorId,
        hospitalId,
        appointmentDate: selectedDate,
        appointmentTime: formattedTime,
        status: "Pending",
        appointmentType: "Consultation",
        reason: "Regular consultation",
        consultationFee: feeVal
      };

      const response = await api.post("/Appointments", payload);
      
      // Handle general API errors and 409 Conflict
      if (!response.success) {
        showNotification(
          "Booking Error",
          response.error || "Failed to create appointment. Please try again.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }
      
      const createdAppt = response.data;

      // Update local context
      const pId = currPatient?.id || currUser?.refId || currUser?.id;
      const pName = createdAppt.patientName || currPatient?.name || currUser?.name || "Patient";
      const pContact = currPatient?.contact || currPatient?.mobile || currUser?.mobile || "9876543210";
      const docHospitalName = createdAppt.hospitalName || doctor.hospital || "MediCare Hospital";

      // Cache created appointment in frontend local context to sync UI & My Appointments
      const localApptObj = {
        id: createdAppt.id,
        doctorId: doctor.id,
        doctorName: createdAppt.doctorName || doctor.name,
        specialty: doctor.specialty || doctor.specialization || "Cardiology",
        hospital: docHospitalName,
        location: doctor.location || "Chennai",
        consultationFee: createdAppt.consultationFee ?? feeVal,
        fee: createdAppt.consultationFee ?? feeVal,
        date: selectedDate,
        formattedDate: formatReadableDate(selectedDate),
        time: selectedSlot,
        status: (createdAppt.status || "Pending").toLowerCase(),
        patientId: pId,
        patientName: pName,
        patientContact: pContact,
        createdAt: createdAppt.createdAt || new Date().toISOString()
      };

      addAppointment(localApptObj);

      addNotification({
        type: "appointment",
        subType: "confirmed",
        title: "Appointment Confirmed",
        message: `Your appointment with ${doctor.name} is confirmed for ${formatReadableDate(selectedDate)} at ${selectedSlot}.`,
        appointmentId: createdAppt.id,
        patientId: pId,
        userId: currUser?.id
      });

      addNotification({
        type: "appointment",
        subType: "confirmed",
        targetRole: "doctor",
        doctorId: doctor.id,
        doctorName: doctor.name,
        title: "New Patient Consultation",
        message: `Patient ${pName} booked a consultation for ${formatReadableDate(selectedDate)} at ${selectedSlot}.`,
        appointmentId: createdAppt.id,
        patientId: pId
      });

      // Navigate to Booking Success page with backend appointment ID
      navigate("/booking-success", {
        state: {
          appointmentId: createdAppt.id,
          doctor,
          specialty: doctor.specialty,
          hospital: docHospitalName,
          date: selectedDate,
          formattedDate: formatReadableDate(selectedDate),
          time: selectedSlot,
          fee: createdAppt.consultationFee ?? feeVal,
          total: createdAppt.consultationFee ?? feeVal
        }
      });
    } catch (err) {
      console.error("Appointment booking error:", err);
      showNotification(
        "Network Error",
        "Unable to connect to backend server. Please verify ASP.NET Core API is running.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMyAppointments = () => {
    navigate("/my-appointments");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleSupport = () => {
    navigate("/help-support");
  };

  return (
    <>
      <main className="doctors-content">
          {/* Top Header Row */}
          <section className="profile-top-controls">
            <button className="btn-back-link" onClick={() => navigate("/doctor-profile", { state: { doctor } })}>
              <ArrowLeft size={16} />
              Back to Profile
            </button>
            <div className="verified-badge-container">
              <span>MediBook Verified</span>
              <ShieldCheck size={16} className="verified-icon" />
            </div>
          </section>

          {/* Page Heading */}
          <section className="doctors-page-header">
            <h2 className="doctors-page-title">Book an Appointment</h2>
          </section>

          {isConfirmed ? (
            /* Success confirmation card */
            <div className="booking-success-container">
              <div className="booking-success-card">
                <div className="success-icon-badge">
                  <CheckCircle2 size={48} className="success-check-icon" />
                </div>
                <h3 className="success-card-title">Appointment Scheduled!</h3>
                <p className="success-card-desc">
                  Your appointment with <strong>{doctor.name}</strong> has been successfully booked. A confirmation email and SMS reminder have been sent to you.
                </p>

                <div className="success-summary-details">
                  <div className="summary-detail-row">
                    <span className="summary-label">Doctor</span>
                    <strong className="summary-val">{doctor.name}</strong>
                  </div>
                  <div className="summary-detail-row">
                    <span className="summary-label">Specialization</span>
                    <strong className="summary-val">{doctor.specialty}</strong>
                  </div>
                  <div className="summary-detail-row">
                    <span className="summary-label">Hospital</span>
                    <strong className="summary-val">{doctor.hospital}</strong>
                  </div>
                  <div className="summary-detail-row">
                    <span className="summary-label">Date</span>
                    <strong className="summary-val">{formatReadableDate(selectedDate)}</strong>
                  </div>
                  <div className="summary-detail-row">
                    <span className="summary-label">Time Slot</span>
                    <strong className="summary-val">{selectedSlot}</strong>
                  </div>
                  <div className="summary-detail-row">
                    <span className="summary-label">Consultation Fee</span>
                    <strong className="summary-val text-primary-color">₹{doctor.consultationFee}</strong>
                  </div>
                </div>

                <div className="success-actions">
                  <Button variant="primary" onClick={() => navigate("/patient-dashboard")}>
                    Go to Patient Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/find-doctor")}>
                    Book Another Appointment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive booking interface */
            <div className="booking-grid-layout">
              
              {/* Left column: Scheduling selection */}
              <div className="booking-selection-column">
                
                {/* Doctor Summary Card */}
                <div className="booking-section-card doctor-summary-horizontal">
                  <div className="doc-avatar-wrapper">
                    <div className="doc-avatar-circle">
                      {getInitials(doctor.name)}
                    </div>
                  </div>
                  <div className="doc-summary-info">
                    <h3 className="doc-summary-name">{doctor.name}</h3>
                    <span className="doc-summary-specialty">{doctor.specialty}</span>
                    
                    <div className="doc-summary-meta">
                      <span className="doc-meta-item">
                        <Building2 size={14} />
                        {doctor.hospital}
                      </span>
                      <span className="doc-meta-item">
                        <MapPin size={14} />
                        {doctor.location}
                      </span>
                      <span className="doc-meta-item">
                        <Briefcase size={14} />
                        {doctor.experience} years experience
                      </span>
                      <span className="doc-meta-item rating">
                        <Star size={14} fill="var(--warning)" className="star-icon" />
                        {doctor.rating} ({doctor.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date Selector Section */}
                <div className="booking-section-card">
                  <h4 className="section-card-title">1. Select Date</h4>
                  <p className="section-card-subtitle">
                    Select an available date below. Booked dates are fully scheduled or unavailable.
                  </p>
                  
                  <div className="selector-wrapper">
                    <DateSelector
                      dates={dates}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      isDateBooked={isDateBooked}
                    />
                  </div>
                </div>

                {/* Time Slots Section */}
                <div className="booking-section-card">
                  <h4 className="section-card-title">2. Select Time Slot</h4>
                  {selectedDate ? (
                    <>
                      <p className="section-card-subtitle">
                        Showing available slots for <strong>{formatReadableDate(selectedDate)}</strong>.
                      </p>
                      <div className="slots-wrapper">
                        <div className="time-slots-container">
                          {/* Morning Group */}
                          {(TIME_SLOTS?.Morning || []).length > 0 && (
                            <TimeSlotGroup title="Morning" icon={<Sunrise size={18} />}>
                              {TIME_SLOTS.Morning.map((time) => (
                                <TimeSlot
                                  key={time}
                                  time={time}
                                  status={getSlotStatus(time)}
                                  onClick={() => setSelectedSlot(time)}
                                />
                              ))}
                            </TimeSlotGroup>
                          )}

                          {/* Afternoon Group */}
                          {(TIME_SLOTS?.Afternoon || []).length > 0 && (
                            <TimeSlotGroup title="Afternoon" icon={<Sun size={18} />}>
                              {TIME_SLOTS.Afternoon.map((time) => (
                                <TimeSlot
                                  key={time}
                                  time={time}
                                  status={getSlotStatus(time)}
                                  onClick={() => setSelectedSlot(time)}
                                />
                              ))}
                            </TimeSlotGroup>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-date-placeholder">
                      <Calendar size={32} />
                      <p>Please select a date first to view available time slots.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column: Reusable Booking Summary component */}
              <div className="booking-summary-column">
                <BookingSummary
                  doctor={doctor}
                  selectedDate={selectedDate}
                  formattedDate={formatReadableDate(selectedDate)}
                  selectedTime={selectedSlot}
                  consultationFee={doctor?.consultationFee || 800}
                  onConfirm={handleConfirmAppointment}
                  isConfirmed={isConfirmed}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}
        </main>

      {/* Floating Toast Notification */}
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
    </>
  );
}

export default AppointmentBooking;
