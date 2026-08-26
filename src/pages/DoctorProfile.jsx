import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Building2,
  Stethoscope,
  Calendar,
  User,
  Heart,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Search
} from "lucide-react";
import doctors from "../data/doctors";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import "./DoctorProfile.css";

// Patient info for Navbar
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

// Specialties mapping to mock expertise tags
const specialtyExpertise = {
  "Cardiology": [
    "Coronary Artery Disease",
    "Hypertension",
    "Heart Failure",
    "Arrhythmia",
    "Angioplasty",
    "Preventive Cardiology",
    "Echocardiography"
  ],
  "Pediatrics": [
    "General Pediatrics",
    "Child Development",
    "Immunization",
    "Pediatric Nutrition",
    "Neonatology",
    "Asthma & Allergies"
  ],
  "Dermatology": [
    "Acne Treatment",
    "Skin Cancer Screening",
    "Eczema & Psoriasis",
    "Laser Surgery",
    "Anti-aging",
    "Dermatopathology"
  ],
  "Neurology": [
    "Stroke Management",
    "Epilepsy",
    "Migraine & Headaches",
    "Parkinson's Disease",
    "Alzheimer's Care",
    "Neuromuscular Disorders"
  ],
  "Orthopedics": [
    "Joint Replacement",
    "Sports Injuries",
    "Fracture Care",
    "Spine Disorders",
    "Arthroscopy",
    "Pediatric Orthopedics"
  ],
  "Gynecology": [
    "Prenatal Care",
    "Minimally Invasive Surgery",
    "Menopause Management",
    "Infertility Evaluation",
    "Pelvic Health"
  ],
  "General Physician": [
    "Chronic Disease Management",
    "Preventive Care",
    "Annual Physicals",
    "Common Cold & Flu",
    "Diabetes Management",
    "Hypertension Control"
  ]
};

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const availableTimeSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "04:00 PM", "05:30 PM"];

function DoctorProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar Open State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Slot Selection State
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");

  // Toast States
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Retrieve selected doctor from navigation state
  const doctorFromState = location.state?.doctor;
  const doctor = doctorFromState || doctors[0] || null;

  // Trigger floating notifications
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

  const handleBookAppointment = () => {
    if (doctor) {
      navigate("/book-appointment", { state: { doctor } });
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

  // Generate initials for avatar
  const getInitials = (name) => {
      if (!name || typeof name.split !== 'function') return "DR";
      return name
        .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate tomorrow's date representation dynamically
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
  };

  // Calculate weekday status based on doctors data availability array
  const getDayStatus = (dayName) => {
    const isAvail = doctor?.availableDays?.some(
      (d) => d.toLowerCase() === dayName.toLowerCase() || d.toLowerCase().startsWith(dayName.toLowerCase().slice(0, 3))
    );
    if (isAvail) {
      return { status: "Available", class: "status-available" };
    }
    if (dayName === "Saturday") {
      return { status: "Limited Slots", class: "status-limited" };
    }
    return { status: "Not Available", class: "status-unavailable" };
  };

  // Handle "Doctor not found" safely
  if (!doctor) {
    return (
      <main className="doctors-content">
        <div className="empty-state">
          <AlertCircle size={48} className="empty-state-icon" />
          <h3 className="empty-state-title">Doctor profile not found</h3>
          <p className="empty-state-desc">
            The doctor profile you are trying to view does not exist or has been removed from our listings.
          </p>
          <Button variant="primary" onClick={() => navigate("/doctors")}>
            Back to Doctors Directory
          </Button>
        </div>
      </main>
    );
  }

  // Generate biographical details dynamically
  const doctorBio = `${doctor.name} is a highly accomplished ${
    doctor.specialty
  } specialist currently practicing at ${doctor.hospital} in ${doctor.location}. With over ${
    doctor.experience
  } years of professional medical experience, they are dedicated to delivering patient-centric, empathetic healthcare. Dr. ${
    (doctor?.name || '').split(" ").pop()
  } completed their ${
    doctor.qualification
  } from leading medical institutions and is committed to using modern diagnostics and compassionate clinical practices to treat patient conditions.`;

  const educationList = (doctor?.qualification || '').split(",").map((deg) => deg.trim());
  const expertiseTags = specialtyExpertise[doctor.specialty] || specialtyExpertise["General Physician"];

  return (
    <>
      <main className="doctors-content">
          {/* Page Header */}
          <PageHeader
            title="Doctor Profile"
            onBack={() => navigate("/doctors")}
            backLabel="Back to Doctors"
            action={
              <div className="verified-badge-container">
                <span>MediBook Verified</span>
                <ShieldCheck size={16} className="verified-icon" />
              </div>
            }
          />

          {/* Doctor Summary Card */}
          <section className="profile-summary-card">
            {/* Left summary details */}
            <div className="summary-left-side">
              <div className="profile-avatar-container large">
                <div className="doc-avatar large-avatar">
                  {getInitials(doctor.name)}
                </div>
                <span
                  className={`doc-availability-dot large-dot ${
                    doctor.availability.toLowerCase().includes("tomorrow") ? "tomorrow" : ""
                  }`}
                ></span>
              </div>

              <div className="summary-info-details">
                <h3 className="profile-doc-name">{doctor.name}</h3>
                <span className="profile-specialty-badge">{doctor.specialty}</span>
                
                <div className="profile-meta-rows">
                  <span className="profile-meta-row">
                    <GraduationCap size={15} className="meta-row-icon" />
                    {doctor.qualification}
                  </span>
                  
                  <span className="profile-meta-row">
                    <Briefcase size={15} className="meta-row-icon" />
                    {doctor.experience} years experience
                  </span>

                  <div className="profile-rating-row">
                    <Star size={15} className="profile-rating-star" />
                    <span className="profile-rating-value">{doctor.rating}</span>
                    <span className="profile-reviews-count">({doctor.reviewCount} patient reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right summary column */}
            <div className="summary-right-side">
              <div className="summary-consult-box">
                <div className="consult-grid-item">
                  <span className="consult-grid-label">Hospital</span>
                  <div className="consult-grid-value-row">
                    <Building2 size={15} className="consult-grid-icon" />
                    <span>{doctor.hospital}</span>
                  </div>
                </div>

                <div className="consult-grid-item">
                  <span className="consult-grid-label">Clinic Location</span>
                  <div className="consult-grid-value-row">
                    <MapPin size={15} className="consult-grid-icon" />
                    <span>{doctor.location}</span>
                  </div>
                </div>

                <div className="consult-grid-item">
                  <span className="consult-grid-label">Consultation Fee</span>
                  <div className="consult-grid-value-row">
                    <span className="fee-symbol">₹</span>
                    <span className="fee-amount">{doctor.consultationFee}</span>
                  </div>
                </div>

                <div className="consult-grid-item">
                  <span className="consult-grid-label">Next Available Slot</span>
                  <div className="consult-grid-value-row">
                    <span
                      className={`avail-indicator-badge ${
                        doctor.availability.toLowerCase().includes("today") ? "today" : "tomorrow"
                      }`}
                    >
                      {doctor.availability}
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="primary" className="btn-book-profile" onClick={handleBookAppointment}>
                Book Appointment
              </Button>
            </div>
          </section>

          {/* Two-Column Layout */}
          <div className="profile-details-grid">
            {/* Left Main Column */}
            <div className="profile-main-column">
              {/* About Card */}
              <section className="details-section-card">
                <h4 className="details-card-title">About {doctor.name}</h4>
                <p className="about-description-text">{doctorBio}</p>
              </section>

              {/* Areas of Expertise */}
              <section className="details-section-card">
                <h4 className="details-card-title">Areas of Expertise</h4>
                <div className="expertise-tags-container">
                  {expertiseTags.map((tag) => (
                    <span key={tag} className="expertise-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* Patient Care */}
              <section className="details-section-card">
                <h4 className="details-card-title">Patient Care</h4>
                <div className="patient-care-grid">
                  <div className="care-item">
                    <div className="care-icon-wrapper">
                      <Heart className="care-icon" size={18} />
                    </div>
                    <span className="care-text">Personalized Treatment</span>
                  </div>
                  <div className="care-item">
                    <div className="care-icon-wrapper">
                      <Activity className="care-icon" size={18} />
                    </div>
                    <span className="care-text">Accurate Diagnosis</span>
                  </div>
                  <div className="care-item">
                    <div className="care-icon-wrapper">
                      <ShieldCheck className="care-icon" size={18} />
                    </div>
                    <span className="care-text">Modern Technology</span>
                  </div>
                  <div className="care-item">
                    <div className="care-icon-wrapper">
                      <User size={18} className="care-icon" />
                    </div>
                    <span className="care-text">Compassionate Care</span>
                  </div>
                </div>
              </section>

              {/* Education Section */}
              <section className="details-section-card">
                <h4 className="details-card-title">Education & Qualifications</h4>
                <div className="timeline-container">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-marker">
                        <div className="timeline-dot"></div>
                        {idx < educationList.length - 1 && <div className="timeline-line"></div>}
                      </div>
                      <div className="timeline-content">
                        <strong className="timeline-item-title">{edu}</strong>
                        <span className="timeline-item-subtitle">
                          {idx === 0
                            ? "Advanced Specialization Training Board"
                            : idx === 1
                            ? "Postgraduate Medical Institute"
                            : "Bachelor of Medicine, Bachelor of Surgery Graduation"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Professional Experience */}
              <section className="details-section-card">
                <h4 className="details-card-title">Professional Experience</h4>
                <div className="experience-timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker">
                      <div className="timeline-dot active-dot"></div>
                      <div className="timeline-line"></div>
                    </div>
                    <div className="timeline-content">
                      <strong className="timeline-item-title">
                        Senior Consultant ({doctor.specialty})
                      </strong>
                      <span className="timeline-item-subtitle">
                        {doctor.hospital} (Current)
                      </span>
                      <p className="experience-description">
                        Overseeing patient consultations, critical procedures, inpatient care diagnostics, and treatment recommendations in the specialized department of {doctor.specialty.toLowerCase()}.
                      </p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-marker">
                      <div className="timeline-dot"></div>
                    </div>
                    <div className="timeline-content">
                      <strong className="timeline-item-title">Resident Medical Specialist</strong>
                      <span className="timeline-item-subtitle">
                        Previous Allied Medical Centers & Clinics ({doctor.experience - 5} years ago)
                      </span>
                      <p className="experience-description">
                        Conducted clinical rounds, managed emergency intake operations, and provided patient consultation support under clinical supervision.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar Column */}
            <div className="profile-side-column">
              {/* Available Days */}
              <section className="side-card">
                <h4 className="side-card-title">Available Days</h4>
                <div className="side-days-list">
                  {weekDays.map((day) => {
                    const { status, class: statusClass } = getDayStatus(day);
                    const shortDay = day.substring(0, 3);
                    return (
                      <div key={day} className="side-day-row">
                        <span className="day-name">{shortDay}</span>
                        <div className="day-status-value">
                          <span className={`status-dot ${statusClass}`}></span>
                          <span className={`status-label-text ${statusClass}`}>{status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Next Available Slots */}
              <section className="side-card">
                <h4 className="side-card-title">Next Available Slots</h4>
                
                <div className="slot-date-subtitle">
                  Tomorrow, {getTomorrowDateString()}
                </div>

                <div className="slots-buttons-grid">
                  {availableTimeSlots.map((slot) => (
                    <button
                      key={slot}
                      className={`slot-time-btn ${selectedSlot === slot ? "selected" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn-full-availability" 
                  onClick={() => showNotification("Schedule Calendar", "Loading full weekly availability calendar...", "info")}
                >
                  View Full Availability →
                </button>
              </section>
            </div>
          </div>
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

export default DoctorProfile;
