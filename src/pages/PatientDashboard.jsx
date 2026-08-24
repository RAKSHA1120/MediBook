import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  CheckCircle,
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
  ShieldCheck,
  Lock,
  Activity
} from "lucide-react";
import doctorsData from "../data/doctors";
import heroIllustration from "../assets/hospital_appointment_illustration.png";
import { useAppointments } from "../context/AppointmentContext";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import Tooltip from "../components/Tooltip";
import DoctorCard from "../components/DoctorCard";
import AppointmentCard from "../components/AppointmentCard";
import SearchBox from "../components/SearchBox";
import EmptyState from "../components/EmptyState";
import "./PatientDashboard.css";

// Local patient object
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

// Default fallback upcoming appointment mock data
const defaultUpcomingAppointment = {
  doctorName: "Dr. Emily Carter",
  specialty: "Cardiology",
  date: "August 26, 2026",
  time: "10:30 AM",
  hospital: "MediCare Hospital",
  status: "Confirmed",
  initials: "EC"
};

// Recommended doctors mock data
const recommendedDoctors = [
  {
    id: 1,
    name: "Dr. Emily Carter",
    specialty: "Dermatologist",
    experience: "8 years",
    rating: 4.8,
    reviewCount: 124,
    consultationFee: 600,
    availability: "Available today",
    initials: "EC"
  },
  {
    id: 2,
    name: "Dr. Michael Lee",
    specialty: "Cardiologist",
    experience: "12 years",
    rating: 4.9,
    reviewCount: 182,
    consultationFee: 800,
    availability: "Available tomorrow",
    initials: "ML"
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    specialty: "Pediatrician",
    experience: "7 years",
    rating: 4.7,
    reviewCount: 95,
    consultationFee: 500,
    availability: "Available today",
    initials: "PS"
  },
  {
    id: 4,
    name: "Dr. Robert Chen",
    specialty: "General Physician",
    experience: "10 years",
    rating: 4.6,
    reviewCount: 110,
    consultationFee: 400,
    availability: "Available today",
    initials: "RC"
  }
];

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
  const { appointments } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal & Toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Navigation and action handlers
  const handleDoctorClick = (docId) => {
    const fullDoc = doctorsData.find(d => d.id === docId) || doctorsData[0];
    navigate("/doctor-profile", { state: { doctor: fullDoc } });
  };

  // Dynamic upcoming appointment from AppointmentContext
  const upcomingAppointment = useMemo(() => {
    const upcoming = appointments.find(
      (a) => a.status && (a.status.toLowerCase() === "upcoming" || a.status.toLowerCase() === "confirmed")
    );
    if (upcoming) {
      const doc = doctorsData.find((d) => String(d.id) === String(upcoming.doctorId)) || {};
      const docName = upcoming.doctorName || doc.name || "Dr. Emily Carter";
      const initials = docName
        .split(" ")
        .filter((n) => n.toLowerCase() !== "dr.")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "EC";

      return {
        id: upcoming.id,
        doctorName: docName,
        specialty: upcoming.specialty || doc.specialty || "Cardiology",
        date: upcoming.formattedDate || upcoming.date || "August 26, 2026",
        time: upcoming.time || "10:30 AM",
        hospital: upcoming.hospital || doc.hospital || "MediCare Hospital",
        status: "Confirmed",
        initials
      };
    }

    return defaultUpcomingAppointment;
  }, [appointments]);

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

  // Filter recommended doctors locally based on selected specialty chip and search bar text
  const filteredDoctors = useMemo(() => {
    return recommendedDoctors.filter((doctor) => {
      // 1. Specialty Filter
      const matchesSpecialty =
        selectedSpecialty === "All" ||
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase() ||
        (selectedSpecialty === "General Physician" && doctor.specialty === "General Physician") ||
        (selectedSpecialty === "Cardiology" && doctor.specialty === "Cardiologist") ||
        (selectedSpecialty === "Dermatology" && doctor.specialty === "Dermatologist") ||
        (selectedSpecialty === "Pediatrics" && doctor.specialty === "Pediatrician");

      // 2. Search Text Filter (name, specialty, or generic search)
      const matchesSearch =
        searchQuery.trim() === "" ||
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpecialty && matchesSearch;
    });
  }, [selectedSpecialty, searchQuery]);

  // Handle Toast triggers
  const showNotification = (title, message, type = "success") => {
    setToast({
      show: true,
      type,
      title,
      message
    });
    // Auto close toast after 4 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate("/doctors", { state: { query: searchQuery } });
  };

  const handleBookAppointment = (docId) => {
    const fullDoc = doctorsData.find(d => d.id === docId) || doctorsData[0];
    navigate("/book-appointment", { state: { doctor: fullDoc } });
  };

  const handleCancelAppointment = () => {
    showNotification("Appointment Cancelled", "Your appointment request has been cancelled.", "error");
  };

  const handleRescheduleAppointment = () => {
    showNotification("Appointment Rescheduling", "Rescheduling flow coming soon.", "info");
  };

  return (
    <div className="patient-dashboard-layout">
      {/* 1. Left Sidebar */}
      <aside className={`patient-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="patient-sidebar-brand">
          <Heart className="brand-logo-icon" size={24} />
          <span>MediBook</span>
        </div>

        <nav className="patient-sidebar-nav">
          <button className="patient-sidebar-item active" onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          
          <button className="patient-sidebar-item" onClick={() => { navigate("/doctors"); setIsSidebarOpen(false); }}>
            <Search size={18} />
            <span>Find Doctor</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { handleMyAppointments(); setIsSidebarOpen(false); }}>
            <Calendar size={18} />
            <span>My Appointments</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { handleNotifications(); setIsSidebarOpen(false); }}>
            <Bell size={18} />
            <span>Notifications</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { handleProfile(); setIsSidebarOpen(false); }}>
            <User size={18} />
            <span>Profile</span>
          </button>

          <button className="patient-sidebar-item" onClick={() => { handleSettings(); setIsSidebarOpen(false); }}>
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
      <div className="patient-dashboard-main">
        <Navbar
          userName={patient.name}
          userRole={patient.role}
          avatarLetter={patient.avatarLetter}
          hideTabs={true}
          hideSearch={false}
          searchPlaceholder="Search doctors..."
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="patient-dashboard-content">
          {/* 2. Greeting Section */}
          <section className="greeting-section">
            <h2 className="greeting-title">
              {getGreeting()}, {patient.name}!
            </h2>
            <p className="greeting-subtitle">
              Find the right doctor and manage your appointments with ease.
            </p>
          </section>

          {/* 3. Hero Banner */}
          <section className="hero-banner">
            <div className="hero-banner-content">
              <h2 className="hero-banner-title">Your Health is Our Priority</h2>
              <p className="hero-banner-description">
                Book appointments with trusted doctors and get the best care.
              </p>
              <div className="hero-banner-action">
                <Button variant="primary" onClick={() => navigate("/doctors")}>
                  Find Doctors
                </Button>
              </div>
            </div>
            <div className="hero-banner-illustration">
              <img src={heroIllustration} alt="Healthcare illustration" />
            </div>
          </section>

          {/* 4. Search Bar Section */}
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

          {/* 5. Improved Top Specialties */}
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

          {/* Upcoming Appointment Section (Full Width) */}
          <section className="upcoming-appointment-section-improved">
            <div className="section-header">
              <h3 className="section-main-title">Upcoming Appointment</h3>
              <button className="view-all-link" onClick={handleMyAppointments}>
                View All
              </button>
            </div>

            {upcomingAppointment ? (
              <AppointmentCard
                appointment={upcomingAppointment}
                onView={() => setIsModalOpen(true)}
                onReschedule={handleRescheduleAppointment}
                onCancel={handleCancelAppointment}
              />
            ) : (
              <EmptyState
                title="No Upcoming Appointment"
                description="You don't have any active appointments scheduled."
                actionLabel="Find a Doctor"
                onAction={() => navigate("/doctors")}
              />
            )}
          </section>

          {/* Right Column: Recommended Doctors */}
          <section className="recommended-doctors-section-improved">
            <div className="section-header">
              <h3 className="section-main-title">Recommended Doctors</h3>
              <button className="view-all-link" onClick={() => navigate("/doctors")}>
                View All
              </button>
            </div>
            <div className="doctors-grid-improved" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    onViewProfile={(d) => handleDoctorClick(d.id)}
                    onBook={(d) => handleBookAppointment(d.id)}
                  />
                ))
              ) : (
                <EmptyState
                  title="No Doctors Found"
                  description={`We couldn't find any doctors matching "${searchQuery}".`}
                  icon={Stethoscope}
                  actionLabel="Clear Filters"
                  onAction={() => { setSelectedSpecialty("All"); setSearchQuery(""); }}
                />
              )}
            </div>
          </section>

          {/* 6. Benefits Section */}
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
      </div>

      {/* Appointment Detail Modal (Reusing existing Modal component) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Appointment Details"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => { setIsModalOpen(false); handleRescheduleAppointment(); }}>
              Reschedule
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "var(--font-body)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <div className="appointment-doctor-avatar" style={{ width: "44px", height: "44px", fontSize: "16px" }}>
              {upcomingAppointment.initials}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "16px", color: "var(--text-heading)", fontFamily: "var(--font-heading)" }}>
                {upcomingAppointment.doctorName}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>
                {upcomingAppointment.specialty}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Hospital:</span>
              <strong style={{ color: "var(--text-heading)" }}>{upcomingAppointment.hospital}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Date:</span>
              <strong style={{ color: "var(--text-heading)" }}>{upcomingAppointment.date}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Time Slot:</span>
              <strong style={{ color: "var(--text-heading)" }}>{upcomingAppointment.time}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)" }}>Status:</span>
              <span className={`status-badge ${upcomingAppointment.status.toLowerCase()}`}>
                <CheckCircle size={12} />
                {upcomingAppointment.status}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Floating Toast Notification (Reusing existing Toast component) */}
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

export default PatientDashboard;
