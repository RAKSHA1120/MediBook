import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Building2,
  Stethoscope,
  IndianRupee,
  Calendar,
  User,
  Heart,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import doctors from "../data/doctors";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Toast from "../components/Toast";
import "./DoctorProfile.css";

// Patient info for Navbar
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

function DoctorProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Get selected doctor from navigation state, fallback to first mock doctor if direct link visited
  const doctorFromState = location.state?.doctor;
  const doctor = doctorFromState || doctors[0] || null;

  // Trigger toast notifications
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
      showNotification(
        "Appointment Booking",
        `Initiating booking flow for ${doctor.name}. Redirecting soon...`,
        "success"
      );
    }
  };

  // Generate dynamic initials for the avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Handle "Doctor not found" state safely to prevent crashes
  if (!doctor) {
    return (
      <div className="profile-page">
        <Navbar
          userName={patient.name}
          userRole={patient.role}
          avatarLetter={patient.avatarLetter}
          hideTabs={true}
          hideSearch={true}
        />
        <main className="profile-content">
          <div className="not-found-container">
            <AlertCircle size={64} className="not-found-icon" />
            <h3 className="not-found-title">Doctor profile not found</h3>
            <p className="not-found-desc">
              The doctor profile you are trying to view does not exist or has been removed from the MediBook directory.
            </p>
            <Button variant="primary" onClick={() => navigate("/doctors")}>
              Back to Doctors Directory
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Generate dynamic biographical description
  const doctorBio = `${doctor.name} is a highly accomplished ${
    doctor.specialty
  } specialist currently practicing in ${doctor.location}. With over ${
    doctor.experience
  } years of professional medical experience, they are dedicated to delivering patient-centric, empathetic healthcare. Dr. ${
    doctor.name.split(" ").pop()
  } completed their ${
    doctor.qualification
  } from leading institutions and is affiliated with ${
    doctor.hospital
  }, where they provide expert clinical consultations and comprehensive treatment plans.`;

  // Split qualifications for a clean education listing
  const educationList = doctor.qualification.split(",").map((deg) => deg.trim());

  return (
    <div className="profile-page">
      {/* 1. Header (Navbar) */}
      <Navbar
        userName={patient.name}
        userRole={patient.role}
        avatarLetter={patient.avatarLetter}
        hideTabs={true}
        hideSearch={true}
      />

      <main className="profile-content">
        {/* 2. Page Header / Navigation */}
        <section className="profile-page-header">
          <div className="back-link-wrapper">
            <button className="btn-back" onClick={() => navigate("/doctors")}>
              <ArrowLeft size={16} />
              Back to Doctors
            </button>
          </div>
          <div className="profile-title-row">
            <h2 className="profile-page-title">Doctor Profile</h2>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              MediBook Verified <ShieldCheck size={14} style={{ color: "var(--success)" }} />
            </span>
          </div>
        </section>

        {/* 3. Main Profile Card */}
        <section className="profile-main-card">
          {/* Left Area: Doctor Avatar & Primary details */}
          <div className="profile-left-panel">
            <div className="profile-avatar-container">
              <div className="doc-profile-avatar">{getInitials(doctor.name)}</div>
              <span
                className={`profile-availability-dot ${
                  doctor.availability.toLowerCase().includes("tomorrow") ? "tomorrow" : ""
                }`}
              ></span>
            </div>

            <div className="profile-info-details">
              <h3 className="profile-doc-name">{doctor.name}</h3>
              <span className="profile-specialty-badge">{doctor.specialty}</span>
              
              <span className="profile-qualification">
                <GraduationCap size={16} />
                {doctor.qualification}
              </span>
              
              <span className="profile-experience">
                <Briefcase size={16} />
                {doctor.experience} years experience
              </span>

              <div className="profile-rating-row">
                <Star size={16} className="profile-rating-star" />
                <span className="profile-rating-value">{doctor.rating}</span>
                <span className="profile-reviews-count">({doctor.reviewCount} patient reviews)</span>
              </div>
            </div>
          </div>

          {/* Right Area: Clinical and Consultation Information */}
          <div className="profile-right-panel">
            <div className="consultation-box">
              <div className="consult-row">
                <Building2 size={18} className="consult-icon" />
                <div>
                  <span className="consult-label">Hospital</span>
                  <span className="consult-value">{doctor.hospital}</span>
                </div>
              </div>

              <div className="consult-row">
                <MapPin size={18} className="consult-icon" />
                <div>
                  <span className="consult-label">Clinic Location</span>
                  <span className="consult-value">{doctor.location}</span>
                </div>
              </div>

              <div className="consult-row">
                <Stethoscope size={18} className="consult-icon" />
                <div>
                  <span className="consult-label">Consultation Fee</span>
                  <span className="consult-value fee-value">₹{doctor.consultationFee}</span>
                </div>
              </div>

              <div className="consult-row">
                <Clock size={18} className="consult-icon" />
                <div>
                  <span className="consult-label">Next Available Slot</span>
                  <span
                    className={`consult-value avail-status ${
                      doctor.availability.toLowerCase().includes("today") ? "today" : "tomorrow"
                    }`}
                  >
                    {doctor.availability}
                  </span>
                </div>
              </div>
            </div>

            <Button variant="primary" onClick={handleBookAppointment}>
              Book Appointment
            </Button>
          </div>
        </section>

        {/* 4. About Doctor Card */}
        <section className="profile-section-card">
          <h4 className="section-title">
            <User size={18} className="section-title-icon" />
            About Doctor
          </h4>
          <p className="about-text">{doctorBio}</p>
        </section>

        {/* 5. Education & Qualifications Card */}
        <section className="profile-section-card">
          <h4 className="section-title">
            <GraduationCap size={18} className="section-title-icon" />
            Education & Qualifications
          </h4>
          <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {educationList.map((edu, idx) => (
              <li key={idx} style={{ fontSize: "14.5px", color: "var(--text-primary)", lineHeight: "1.4" }}>
                <strong>{edu}</strong> — Board Certified and Clinical Specialist training
              </li>
            ))}
          </ul>
        </section>

        {/* 6. Experience Timeline Card */}
        <section className="profile-section-card">
          <h4 className="section-title">
            <Briefcase size={18} className="section-title-icon" />
            Professional Experience
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)", marginTop: "6px" }}></div>
                <div style={{ width: "2px", flex: 1, background: "var(--border)", margin: "4px 0" }}></div>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "14.5px", color: "var(--text-heading)" }}>
                  Senior Consultant ({doctor.specialty})
                </strong>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  {doctor.hospital} (Current practicing hospital)
                </span>
                <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "var(--text-primary)" }}>
                  Lead practitioner managing specialized diagnostic work, consultations, and complex inpatient cases in the department of {doctor.specialty.toLowerCase()}.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--text-muted)", marginTop: "6px" }}></div>
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "14.5px", color: "var(--text-heading)" }}>
                  Resident Medical Specialist
                </strong>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Previous Medical Centers & Residency Clinics ({doctor.experience - 5} years ago)
                </span>
                <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "var(--text-primary)" }}>
                  Managed clinical consultations, emergency treatments, and patient care workflows under department supervisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Available Days Section */}
        <section className="profile-section-card">
          <h4 className="section-title">
            <Calendar size={18} className="section-title-icon" />
            Available Days
          </h4>
          <div className="days-chips-container">
            {doctor.availableDays && doctor.availableDays.map((day) => (
              <div key={day} className="day-chip">
                {day}
              </div>
            ))}
          </div>
        </section>

        {/* 8. Book Appointment CTA Footer */}
        <section className="profile-section-card" style={{ alignItems: "center", gap: "12px", textAlign: "center" }}>
          <h4 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--text-heading)" }}>
            Ready to schedule your visit with {doctor.name}?
          </h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-primary)", maxWidth: "500px" }}>
            Book a confirmed consultation slot today. No upfront booking fees are charged.
          </p>
          <div style={{ marginTop: "8px", width: "100%", maxWidth: "320px" }}>
            <Button variant="primary" onClick={handleBookAppointment} style={{ width: "100%" }}>
              Book Appointment Now
            </Button>
          </div>
        </section>
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
    </div>
  );
}

export default DoctorProfile;
