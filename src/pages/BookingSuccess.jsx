import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building2,
  Heart,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  CalendarDays,
  AlertCircle,
  ShieldCheck,
  Tag,
  Receipt
} from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Toast from "../components/Toast";
import "./BookingSuccess.css";

// Patient info for Navbar
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar Open State for Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Retrieve booking state passed from AppointmentBooking
  const bookingState = location.state;

  // Extract appointment data safely with default fallbacks
  const appointmentId = bookingState?.appointmentId;
  const doctor = bookingState?.doctor;
  const specialty = bookingState?.specialty || doctor?.specialty;
  const hospital = bookingState?.hospital || doctor?.hospital;
  const displayDate = bookingState?.formattedDate || bookingState?.date;
  const displayTime = bookingState?.time;
  const fee = bookingState?.fee ?? doctor?.consultationFee ?? 800;
  const total = bookingState?.total ?? fee;

  const showNotification = (title, message, type = "success") => {
    setToast({
      show: true,
      type,
      title,
      message
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleViewAppointment = () => {
    showNotification("My Appointments", "Navigating to your appointment records...", "info");
    setTimeout(() => {
      navigate("/patient-dashboard");
    }, 1000);
  };

  const handleGoToDashboard = () => {
    navigate("/patient-dashboard");
  };

  const handleSupport = () => {
    showNotification("Help & Support", "Connecting to MediBook Support...", "success");
  };

  return (
    <div className="doctors-page-layout">
      {/* 1. Left Sidebar */}
      <aside className={`patient-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="patient-sidebar-brand">
          <Heart className="brand-logo-icon" size={24} />
          <span>MediBook</span>
        </div>

        <nav className="patient-sidebar-nav">
          <button className="patient-sidebar-item" onClick={() => navigate("/patient-dashboard")}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button className="patient-sidebar-item" onClick={() => { navigate("/doctors"); setIsSidebarOpen(false); }}>
            <Search size={18} />
            <span>Find Doctor</span>
          </button>

          <button className="patient-sidebar-item active" onClick={() => { handleViewAppointment(); setIsSidebarOpen(false); }}>
            <CalendarDays size={18} />
            <span>My Appointments</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { showNotification("Notifications", "Opening notifications...", "info"); setIsSidebarOpen(false); }}>
            <Bell size={18} />
            <span>Notifications</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { showNotification("Profile", "Opening profile...", "info"); setIsSidebarOpen(false); }}>
            <User size={18} />
            <span>Profile</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { showNotification("Settings", "Opening settings...", "info"); setIsSidebarOpen(false); }}>
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { handleSupport(); setIsSidebarOpen(false); }}>
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </button>
        </nav>

        <div className="patient-sidebar-footer">
          <div className="support-card">
            <span className="support-card-title">Need Help?</span>
            <p className="support-card-text">Our support team is available 24/7 to answer your queries.</p>
            <Button variant="primary" size="sm" className="btn-support" onClick={handleSupport}>
              Contact Support
            </Button>
          </div>

          <button className="patient-sidebar-item logout" onClick={() => navigate("/login")}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <div className="doctors-page-main">
        {/* Navbar */}
        <Navbar
          userName={patient.name}
          userRole={patient.role}
          avatarLetter={patient.avatarLetter}
          hideTabs={true}
          hideSearch={true}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="doctors-content booking-success-wrapper">
          {bookingState && doctor ? (
            /* Standard Booking Confirmation View */
            <div className="booking-success-card">
              {/* Header Icon & Title */}
              <div className="success-header">
                <div className="success-icon-badge">
                  <CheckCircle2 size={54} className="success-check-icon" />
                </div>
                <h2 className="success-title">Appointment Confirmed!</h2>
                <p className="success-subtitle">
                  Your appointment has been successfully booked with the doctor. Please keep your appointment ID for future reference.
                </p>
              </div>

              {/* Appointment Details Section */}
              <div className="success-details-section">
                <h3 className="details-section-heading">Appointment Details</h3>

                <div className="details-grid">
                  {/* Doctor Name */}
                  <div className="detail-item">
                    <span className="detail-label">Doctor</span>
                    <strong className="detail-value text-heading">{doctor?.name}</strong>
                  </div>

                  {/* Specialization */}
                  <div className="detail-item">
                    <span className="detail-label">Specialization</span>
                    <strong className="detail-value">{specialty}</strong>
                  </div>

                  {/* Hospital */}
                  <div className="detail-item">
                    <span className="detail-label">Hospital</span>
                    <strong className="detail-value">{hospital}</strong>
                  </div>

                  {/* Date */}
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <strong className="detail-value">{displayDate}</strong>
                  </div>

                  {/* Time */}
                  <div className="detail-item">
                    <span className="detail-label">Time</span>
                    <strong className="detail-value">{displayTime}</strong>
                  </div>

                  {/* Consultation Fee */}
                  <div className="detail-item">
                    <span className="detail-label">Consultation Fee</span>
                    <strong className="detail-value">₹{fee}</strong>
                  </div>

                  {/* Total */}
                  <div className="detail-item highlight-row">
                    <span className="detail-label">Total</span>
                    <strong className="detail-value total-price">₹{total}</strong>
                  </div>

                  {/* Appointment ID */}
                  <div className="detail-item highlight-row id-row">
                    <span className="detail-label">Appointment ID</span>
                    <strong className="detail-value apt-id-badge">{appointmentId}</strong>
                  </div>
                </div>

                <div className="notice-box">
                  <ShieldCheck size={16} className="notice-icon" />
                  <span>No upfront payment needed. Pay ₹{total} at the hospital counter upon arrival.</span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="success-action-buttons">
                <Button
                  variant="primary"
                  className="btn-success-action"
                  onClick={handleViewAppointment}
                >
                  View Appointment
                </Button>

                <Button
                  variant="outline"
                  className="btn-success-action"
                  onClick={handleGoToDashboard}
                >
                  Go To Dashboard
                </Button>
              </div>
            </div>
          ) : (
            /* Direct Access / Empty State */
            <div className="booking-success-card empty-state-card">
              <div className="empty-icon-badge">
                <AlertCircle size={48} className="empty-alert-icon" />
              </div>
              <h2 className="empty-title">No Appointment Found</h2>
              <p className="empty-subtitle">
                No appointment information is available. Please select a doctor and book an appointment.
              </p>

              <Button
                variant="primary"
                className="btn-success-action"
                onClick={handleGoToDashboard}
              >
                Go To Dashboard
              </Button>
            </div>
          )}
        </main>
      </div>

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
    </div>
  );
}

export default BookingSuccess;
