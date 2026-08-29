import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Stethoscope,
  ChevronRight,
  Heart,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  Baby,
  Bone,
  Brain,
  Activity,
  CalendarPlus,
  AlertTriangle,
  ShieldCheck,
  Lock
} from "lucide-react";
import heroIllustration from "../assets/hospital_appointment_illustration.png";
import { useAppointments } from "../context/AppointmentContext";
import { getStoredNotifications, addNotification } from "../data/notifications";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";
import Modal from "../components/Modal";

import AppointmentCard from "../components/AppointmentCard";
import EmptyState from "../components/EmptyState";
import "./PatientDashboard.css";

import heroIllustration from "../assets/hospital_appointment_illustration.png";
import { useAppointments } from "../context/AppointmentContext";

// Specialties filter list
const specialties = [
  "All",
  "General Physician",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology"
];

// Doctor counts for each specialty
const specialtyCounts = {
  "All": 0,
  "General Physician": 85,
  "Cardiology": 120,
  "Dermatology": 95,
  "Neurology": 60,
  "Pediatrics": 130,
  "Orthopedics": 110,
  "Gynecology": 75
};

// Map specialty names to icons
const getSpecialtyIcon = (specialty) => {
  switch (specialty) {
    case "Cardiology":
      return <Activity size={24} />;
    case "Dermatology":
      return <Sparkles size={24} />;
    case "Pediatrics":
      return <Baby size={24} />;
    case "Orthopedics":
      return <Bone size={24} />;
    case "General Physician":
      return <Stethoscope size={24} />;
    case "Neurology":
      return <Brain size={24} />;
    case "Gynecology":
      return <User size={24} />;
    default:
      return <Stethoscope size={24} />;
  }
};

function PatientDashboard() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  // Modal & Toast states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Notifications / Recent Activity state
  const [allNotifications, setAllNotifications] = useState(() => getStoredNotifications());

  const [doctorsList, setDoctorsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return allNotifications.filter(n => !n.userId || n.userId === currentUser.id || n.userId === currentUser.refId);
  }, [allNotifications, currentUser]);

  useEffect(() => {
    setDoctorsList(getDoctors());
    setCurrentUser(getCurrentUser());
  }, []);

  // Navigation and action handlers

  // Dynamic upcoming appointment from AppointmentContext
  const upcomingAppointment = useMemo(() => {
    if (!appointments || appointments.length === 0 || !currentUser) return null;
    const upcoming = appointments.find((a) => {
      const isMyAppointment = a.patientId === currentUser?.refId || a.patientId === currentUser?.id || a.patientName === currentUser?.name;
      if (!isMyAppointment) return false;

      if (!a.status) return true;
      const s = String(a.status).toLowerCase();
      return s === "upcoming" || s === "confirmed" || s === "scheduled";
    });

    if (!upcoming) return null;

    const docName = upcoming.doctorName || "Dr. Emily Carter";
    const initials = docName
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "EC";

    return {
      id: upcoming.id,
      doctorId: upcoming.doctorId,
      doctorName: docName,
      specialty: upcoming.specialty || "Cardiology",
      hospital: upcoming.hospital || "MediCare Hospital",
      location: upcoming.location || "Chennai",
      date: upcoming.formattedDate || upcoming.date || "Wed, Aug 26, 2026",
      time: upcoming.time || "09:00 AM",
      consultationFee: upcoming.consultationFee ?? 800,
      status: upcoming.status || "Confirmed",
      initials
    };
  }, [appointments, doctorsList, currentUser]);

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

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };


  // Recent activities slice
  const recentActivities = useMemo(() => {
    return notifications.slice(0, 3);
  }, [notifications]);

  // Handle Toast triggers
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/doctors", { state: { query: searchQuery } });
  };


  // Cancellation Flow
  const handleInitiateCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!upcomingAppointment || !upcomingAppointment.id) return;

    cancelAppointment(upcomingAppointment.id);

    storageAddNotif({
      id: Date.now(),
      type: "appointment",
      subType: "cancelled",
      title: "Appointment Cancelled",
      message: `Your appointment with ${upcomingAppointment.doctorName} on ${upcomingAppointment.date} has been cancelled.`,
      appointmentId: upcomingAppointment.id,
      userId: currentUser?.refId || currentUser?.id,
      read: false,
      createdAt: new Date().toLocaleTimeString()
    });

    setShowCancelModal(false);

    showNotification(
      "Appointment Cancelled",
      "Your appointment has been successfully cancelled.",
      "error"
    );
  };

  const handleReschedule = () => {
    if (upcomingAppointment && upcomingAppointment.id) {
      navigate(`/appointments/${upcomingAppointment.id}`);
    } else {
      navigate("/my-appointments");
    }
  };

  const handleViewAppointment = () => {
    if (upcomingAppointment && upcomingAppointment.id) {
      navigate(`/appointments/${upcomingAppointment.id}`);
    } else {
      navigate("/my-appointments");
    }
  };

  return (
    <>
      <main className="patient-dashboard-content">
        {/* Greeting Section */}
        <section className="greeting-section">
          <h2 className="greeting-title">
            {getGreeting()}, {currentUser?.name || "Patient"}!
          </h2>
          <p className="greeting-subtitle">
            Find the right doctor and manage your appointments with ease.
          </p>
        </section>

        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-banner-content">
            <h2 className="hero-banner-title">Your Health is Our Priority</h2>
            <p className="hero-banner-description">
              Book appointments with trusted doctors and get the best care.
            </p>
            <div className="hero-banner-action">
              {/* Find Doctors link removed */}
            </div>
          </div>
          <div className="hero-banner-illustration">
            <img src={heroIllustration} alt="Healthcare illustration" />
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="search-section">
          <h3 className="search-section-title">Find a doctor</h3>
          <form onSubmit={handleSearchSubmit} className="search-box-container">
            <div className="search-input-wrapper">
              <Input
                type="text"
                placeholder="Search doctors, specialties or hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="search-btn">
              <Button type="submit">Search</Button>
            </div>
          </form>
        </section>

        {/* Top Specialties Horizontal Carousel */}
        <section className="specialties-section-improved">
          <div className="section-header">
            <h3 className="section-main-title">Top Specialties</h3>
            <button className="view-all-link" onClick={() => setSelectedSpecialty("All")}>
              View All
            </button>
          </div>
          <div className="specialty-cards-container">
            {specialties.filter((s) => s !== "All").map((specialty) => (
              <div
                key={specialty}
                className={`specialty-card ${selectedSpecialty === specialty ? "active" : ""}`}
                onClick={() => setSelectedSpecialty(selectedSpecialty === specialty ? "All" : specialty)}
              >
                <div className="specialty-icon-wrapper">
                  {getSpecialtyIcon(specialty)}
                </div>
                <div className="specialty-card-info">
                  <span className="specialty-card-name">{specialty}</span>
                  <span className="specialty-card-count">{specialtyCounts[specialty] || 50} Doctors</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN INFORMATION AREA: Next Appointment (Left 65%) + Quick Actions (Right 35%) */}
        <section className="dashboard-main-info-grid">
          {/* Left Column: Next Appointment Card */}
          <div className="next-appointment-column">
            <div className="section-header">
              <h3 className="section-main-title">Next Appointment</h3>
              <button className="view-all-link" onClick={handleMyAppointments}>
                View All
              </button>
            </div>

            {upcomingAppointment ? (
              <AppointmentCard
                appointment={upcomingAppointment}
                onView={handleViewAppointment}
                onReschedule={handleReschedule}
                onCancel={handleInitiateCancel}
              />
            ) : (
              <EmptyState
                title="No Upcoming Appointment"
                description="You don't have any active appointments scheduled."
                actionLabel="Find a Doctor"
                onAction={() => navigate("/doctors")}
              />
            )}
          </div>

          {/* Right Column: Quick Actions */}
          <div className="quick-actions-column">
            <div className="section-header">
              <h3 className="section-main-title">Quick Actions</h3>
            </div>

            <div className="quick-actions-card">
              <div className="quick-actions-list">
                <button className="quick-action-btn" onClick={() => navigate("/doctors")}>
                  <div className="quick-action-icon-wrap">
                    <Search size={20} />
                  </div>
                  <div className="quick-action-text-group">
                    <span className="quick-action-title">Find Doctor</span>
                    <span className="quick-action-sub">Search top specialists</span>
                  </div>
                  <ChevronRight size={16} className="quick-action-arrow" />
                </button>

                <button className="quick-action-btn" onClick={() => navigate("/doctors")}>
                  <div className="quick-action-icon-wrap">
                    <CalendarPlus size={20} />
                  </div>
                  <div className="quick-action-text-group">
                    <span className="quick-action-title">Book Appointment</span>
                    <span className="quick-action-sub">Schedule a doctor visit</span>
                  </div>
                  <ChevronRight size={16} className="quick-action-arrow" />
                </button>

                <button className="quick-action-btn" onClick={() => navigate("/my-appointments")}>
                  <div className="quick-action-icon-wrap">
                    <Calendar size={20} />
                  </div>
                  <div className="quick-action-text-group">
                    <span className="quick-action-title">My Appointments</span>
                    <span className="quick-action-sub">View existing bookings</span>
                  </div>
                  <ChevronRight size={16} className="quick-action-arrow" />
                </button>

                <button className="quick-action-btn" onClick={() => navigate("/notifications")}>
                  <div className="quick-action-icon-wrap">
                    <Bell size={20} />
                  </div>
                  <div className="quick-action-text-group">
                    <span className="quick-action-title">Notifications</span>
                    <span className="quick-action-sub">Check updates & alerts</span>
                  </div>
                  <ChevronRight size={16} className="quick-action-arrow" />
                </button>
              </div>
            </div>
          </div>
        </section>



        {/* Recent Activity Section */}
        <section className="recent-activity-section">
          <div className="section-header">
            <h3 className="section-main-title">Recent Activity</h3>
            <button className="view-all-link" onClick={() => navigate("/notifications")}>
              View All
            </button>
          </div>

          <div className="recent-activity-card">
            {recentActivities.length > 0 ? (
              <div className="recent-activity-list">
                {recentActivities.map((activity) => {
                  const s = (activity.subType || activity.type || "").toLowerCase();
                  let icon = <CheckCircle2 size={18} className="activity-icon confirmed" />;
                  if (s.includes("cancel")) {
                    icon = <XCircle size={18} className="activity-icon cancelled" />;
                  } else if (s.includes("resched")) {
                    icon = <Clock size={18} className="activity-icon rescheduled" />;
                  } else if (s.includes("remind") || activity.type === "reminder") {
                    icon = <Bell size={18} className="activity-icon reminder" />;
                  } else if (activity.type === "system") {
                    icon = <Activity size={18} className="activity-icon system" />;
                  }

                  return (
                    <div
                      key={activity.id}
                      className="activity-item"
                      onClick={() => navigate("/notifications")}
                    >
                      <div className="activity-icon-container">{icon}</div>
                      <div className="activity-content">
                        <div className="activity-title-row">
                          <h4 className="activity-title">{activity.title}</h4>
                          <span className="activity-time">{activity.createdAt}</span>
                        </div>
                        <p className="activity-message">{activity.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-activity-text">No recent activity to display.</p>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <CalendarCheck size={24} />
            </div>
            <h4 className="benefit-title">Easy Booking</h4>
            <p className="benefit-description">Book appointments in just a few taps</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h4 className="benefit-title">Trusted Doctors</h4>
            <p className="benefit-description">Verified and experienced doctors</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <Clock size={24} />
            </div>
            <h4 className="benefit-title">Save Time</h4>
            <p className="benefit-description">Quick scheduling and reminders</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <Lock size={24} />
            </div>
            <h4 className="benefit-title">Safe & Secure</h4>
            <p className="benefit-description">Your data is protected</p>
          </div>
        </section>
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && upcomingAppointment && (
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
                <strong>Doctor:</strong> {upcomingAppointment.doctorName}
              </div>
              <div>
                <strong>Specialization:</strong> {upcomingAppointment.specialty}
              </div>
              <div>
                <strong>Date & Time:</strong> {upcomingAppointment.date} at {upcomingAppointment.time}
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
        </Modal>
      )}

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

export default PatientDashboard;
