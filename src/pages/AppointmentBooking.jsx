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
import doctors from "../data/doctors";
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
  const doctor = location.state?.doctor || (doctors && doctors[0]) || {
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
  
  // Success Confirmation State
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  // Handle Confirm Booking
  const handleConfirmAppointment = () => {
    if (!selectedDate || !selectedSlot) return;

    // Check again if slot is booked
    if (isSlotBooked(doctor.id, selectedDate, selectedSlot)) {
      showNotification(
        "Slot Unavailable",
        "This time slot has already been booked. Please select another slot.",
        "error"
      );
      return;
    }

    const yyyymmdd = selectedDate.replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
    const generatedAptId = `MB-APT-${yyyymmdd}-${randomSuffix}`;

    const newAppt = {
      id: generatedAptId,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      location: doctor.location || "Chennai",
      consultationFee: doctor.consultationFee || 800,
      date: selectedDate,
      formattedDate: formatReadableDate(selectedDate),
      time: selectedSlot,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };
    
    const result = addAppointment(newAppt);
    if (!result.success) {
      showNotification("Booking Failed", result.message, "error");
      return;
    }

    addNotification({
      type: "appointment",
      subType: "confirmed",
      title: "Appointment Confirmed",
      message: `Your appointment with ${doctor.name} on ${formatReadableDate(selectedDate)} at ${selectedSlot} has been confirmed.`,
      appointmentId: generatedAptId
    });

    navigate("/booking-success", {
      state: {
        appointmentId: generatedAptId,
        doctor,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        date: selectedDate,
        formattedDate: formatReadableDate(selectedDate),
        time: selectedSlot,
        fee: doctor.consultationFee,
        total: doctor.consultationFee
      }
    });
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
                  <Button variant="outline" onClick={() => navigate("/doctors")}>
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
