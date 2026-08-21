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
  Stethoscope,
  Activity,
  Sparkles,
  Baby,
  Bone,
  Brain
} from "lucide-react";
import doctorsData from "../data/doctors";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import Tooltip from "../components/Tooltip";
import "./PatientDashboard.css";

// Local patient object
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

// Local upcoming appointment mock data
const upcomingAppointment = {
  doctorName: "Dr. Sarah Johnson",
  specialty: "Cardiologist",
  date: "August 25, 2026",
  time: "10:30 AM",
  hospital: "MediCare Hospital",
  status: "Confirmed",
  initials: "SJ"
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  
  // Modal & Toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Navigation and action handlers
  const handleDoctorClick = (docId) => {
    const fullDoc = doctorsData.find(d => d.id === docId) || doctorsData[0];
    navigate("/doctor-profile", { state: { doctor: fullDoc } });
  };

  const handleMyAppointments = () => {
    showNotification("My Appointments", "Opening your appointment records...", "info");
  };

  const handleNotifications = () => {
    showNotification("Notifications", "Opening notifications panel...", "info");
  };

  const handleProfile = () => {
    showNotification("Profile Settings", "Opening patient profile editor...", "info");
  };

  const handleSettings = () => {
    showNotification("Settings", "Opening system settings...", "info");
  };

  const handleSupport = () => {
    showNotification("Help & Support", "Connecting to MediBook Support...", "success");
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

  const handleBookAppointment = (doctorName) => {
    showNotification("Appointment Booking", `Booking flow for ${doctorName} is coming soon.`, "info");
  };

  const handleCancelAppointment = () => {
    showNotification("Appointment Cancelled", "Your appointment request has been cancelled.", "error");
  };

  const handleRescheduleAppointment = () => {
    showNotification("Appointment Rescheduling", "Rescheduling flow coming soon.", "info");
  };

  return (
    <div className="patient-dashboard-page">
      <Navbar
        userName={patient.name}
        userRole={patient.role}
        avatarLetter={patient.avatarLetter}
        hideTabs={true}
        hideSearch={true}
      />

      <main className="patient-dashboard-content">
        {/* 1. Greeting Section */}
        <section className="greeting-section">
          <h2 className="greeting-title">
            {getGreeting()}, {patient.name}!
          </h2>
          <p className="greeting-subtitle">
            Find the right doctor and manage your appointments with ease.
          </p>
        </section>

        {/* 2. Search Bar Section */}
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

        {/* 3. Specialty Chips */}
        <section className="specialties-section">
          <span className="specialties-title">Search by Specialty</span>
          <div className="specialty-chips-container">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                className={`specialty-chip ${selectedSpecialty === specialty ? "active" : ""}`}
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
        </section>

        {/* 4. Upcoming Appointment + Recommended Doctors (Two Column Grid) */}
        <div className="dashboard-grid-two-columns">
          {/* Left Column: Upcoming Appointment */}
          <section className="upcoming-appointment-section-improved">
            <div className="section-header">
              <h3 className="section-main-title">Upcoming Appointment</h3>
              <button className="view-all-link" onClick={handleMyAppointments}>
                View All
              </button>
            </div>
            <div className="appointment-card-improved">
              <div className="appointment-card-top">
                <div className="appointment-doctor-info">
                  <div className="appointment-doctor-avatar">
                    {upcomingAppointment.initials}
                  </div>
                  <div className="appointment-doctor-details">
                    <h4 className="appointment-doctor-name">{upcomingAppointment.doctorName}</h4>
                    <span className="appointment-doctor-specialty">{upcomingAppointment.specialty}</span>
                    <span className="appointment-hospital">
                      <MapPin size={12} style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }} />
                      {upcomingAppointment.hospital}
                    </span>
                  </div>
                </div>
                <div className={`status-badge-improved ${upcomingAppointment.status.toLowerCase()}`}>
                  <CheckCircle size={12} />
                  {upcomingAppointment.status}
                </div>
              </div>

              <div className="appointment-card-middle">
                <div className="appointment-schedule-item">
                  <Calendar size={16} />
                  <span>{upcomingAppointment.date}</span>
                </div>
                <div className="appointment-schedule-item">
                  <Clock size={16} />
                  <span>{upcomingAppointment.time}</span>
                </div>
              </div>

              <div className="appointment-card-actions">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  View Details
                </Button>
                <Button variant="outline" onClick={handleRescheduleAppointment}>
                  Reschedule
                </Button>
                <Button variant="outline" className="btn-cancel" onClick={handleCancelAppointment}>
                  Cancel
                </Button>
              </div>
            </div>
          </section>

          {/* Right Column: Recommended Doctors */}
          <section className="recommended-doctors-section-improved">
            <div className="section-header">
              <h3 className="section-main-title">Recommended Doctors</h3>
              <button className="view-all-link" onClick={() => navigate("/doctors")}>
                View All
              </button>
            </div>
            <div className="doctors-grid-improved">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="doctor-card-improved" onClick={() => handleDoctorClick(doctor.id)}>
                    <div className="doctor-card-header">
                      <div className="doctor-avatar">
                        {doctor.initials}
                      </div>
                      <div className="doctor-meta">
                        <h4 className="doctor-name">{doctor.name}</h4>
                        <span className="doctor-specialty">{doctor.specialty}</span>
                      </div>
                    </div>
                    
                    <div className="doctor-card-body">
                      <div className="doctor-detail-row">
                        <span>Experience</span>
                        <strong>{doctor.experience}</strong>
                      </div>
                      <div className="doctor-detail-row">
                        <span>Rating</span>
                        <span className="doctor-rating">
                          <Star size={14} fill="var(--warning)" className="rating-star-icon" />
                          {doctor.rating} ({doctor.reviewCount} reviews)
                        </span>
                      </div>
                      <div className="doctor-detail-row">
                        <span>Consultation Fee</span>
                        <strong>₹{doctor.consultationFee}</strong>
                      </div>
                      <div className="doctor-detail-row">
                        <span>Availability</span>
                        <span className="doctor-availability">
                          <span className="availability-dot"></span>
                          {doctor.availability}
                        </span>
                      </div>
                    </div>

                    <div className="doctor-card-footer" onClick={(e) => e.stopPropagation()}>
                      <Button variant="primary" onClick={() => handleBookAppointment(doctor.name)}>
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-doctors-found">
                  <Stethoscope size={40} className="no-doctors-icon" />
                  <h4>No Doctors Found</h4>
                  <p>We couldn't find any doctors matching "{searchQuery}" under the "{selectedSpecialty}" specialty filter.</p>
                  <Button variant="secondary" onClick={() => { setSelectedSpecialty("All"); setSearchQuery(""); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

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
