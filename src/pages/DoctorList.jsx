import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Building2,
  Stethoscope,
  X,
  User,
  Activity,
  Heart
} from "lucide-react";
import doctors from "../data/doctors";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import Card from "../components/Card";
import "./DoctorList.css";

// Specialties list for filter options
const specialtyOptions = [
  { value: "All", label: "All Specialties" },
  { value: "General Physician", label: "General Physician" },
  { value: "Cardiology", label: "Cardiology" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Neurology", label: "Neurology" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "Gynecology", label: "Gynecology" }
];

// Patient info for Navbar
const patient = {
  name: "Raksha",
  role: "Patient",
  avatarLetter: "R"
};

function DoctorList() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.query || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  // Detail Modal & Toast States
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Generate location options dynamically from mock doctor data
  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(new Set(doctors.map((d) => d.location)));
    return [
      { value: "All", label: "All Locations" },
      ...uniqueLocations.map((loc) => ({ value: loc, label: loc }))
    ];
  }, []);

  // Combined filtering logic using useMemo
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // 1. Search filter: Match against name, specialty, hospital, or location
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query) ||
        doc.hospital.toLowerCase().includes(query) ||
        doc.location.toLowerCase().includes(query);

      // 2. Specialty filter
      const matchesSpecialty =
        selectedSpecialty === "All" ||
        doc.specialty.toLowerCase() === selectedSpecialty.toLowerCase() ||
        (selectedSpecialty === "General Physician" && doc.specialty === "General Physician") ||
        (selectedSpecialty === "Cardiology" && doc.specialty === "Cardiologist") ||
        (selectedSpecialty === "Dermatology" && doc.specialty === "Dermatologist") ||
        (selectedSpecialty === "Pediatrics" && doc.specialty === "Pediatrician");

      // 3. Location filter
      const matchesLocation =
        selectedLocation === "All" ||
        doc.location.toLowerCase() === selectedLocation.toLowerCase();

      return matchesSearch && matchesSpecialty && matchesLocation;
    });
  }, [searchQuery, selectedSpecialty, selectedLocation]);

  // Check if any filters are active
  const isFiltersActive = useMemo(() => {
    return searchQuery.trim() !== "" || selectedSpecialty !== "All" || selectedLocation !== "All";
  }, [searchQuery, selectedSpecialty, selectedLocation]);

  // Reset all filters to default
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("All");
    setSelectedLocation("All");
    showNotification("Filters Reset", "All search filters have been cleared.", "info");
  };

  // Helper to trigger floating toast
  const showNotification = (title, message, type = "success") => {
    setToast({
      show: true,
      type,
      title,
      message
    });
    // Auto hide toast
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleBookAppointment = (doctorName) => {
    showNotification("Appointment Booking", `Initiating booking flow for ${doctorName}...`, "success");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .filter((n) => n.toLowerCase() !== "dr.")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="doctors-page">
      {/* Header / Navbar */}
      <Navbar
        userName={patient.name}
        userRole={patient.role}
        avatarLetter={patient.avatarLetter}
        hideTabs={true}
        hideSearch={true}
      />

      <main className="doctors-content">
        {/* Page Title & Banner */}
        <section className="doctors-page-header">
          <h2 className="doctors-page-title">Find the right doctor for you</h2>
          <p className="doctors-page-subtitle">
            Search and choose a doctor based on specialty, location and availability.
          </p>
        </section>

        {/* Filters Panel */}
        <section className="filters-bar">
          <div className="filters-row">
            {/* Search Input */}
            <div className="filter-search-wrapper">
              <Input
                type="text"
                placeholder="Search by doctor name, specialty or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>

            {/* Specialty Dropdown */}
            <div className="filter-select-wrapper">
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                options={specialtyOptions}
                placeholder="Select Specialty"
              />
            </div>

            {/* Location Dropdown */}
            <div className="filter-select-wrapper">
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                options={locationOptions}
                placeholder="Select Location"
              />
            </div>
          </div>

          {/* Reset Filters Option */}
          {isFiltersActive && (
            <div className="clear-filters-btn-wrapper">
              <button className="btn-link" onClick={handleClearFilters}>
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Doctors Grid / Empty State */}
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {filteredDoctors.length > 0 ? (
            <div className="doctors-list-grid">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="doc-list-card">
                  {/* Card Header */}
                  <div className="doc-card-header">
                    <div className="doc-avatar-container">
                      <div className="doc-avatar">
                        {getInitials(doc.name)}
                      </div>
                      <span
                        className={`doc-availability-dot ${
                          doc.availability.toLowerCase().includes("tomorrow") ? "tomorrow" : ""
                        }`}
                      ></span>
                    </div>

                    <div className="doc-header-details">
                      <h4 className="doc-name">{doc.name}</h4>
                      <span className="doc-specialty-badge">{doc.specialty}</span>
                      <span className="doc-qualification">
                        <GraduationCap
                          size={13}
                          style={{ marginRight: "4px", display: "inline-block", verticalAlign: "middle" }}
                        />
                        {doc.qualification}
                      </span>
                    </div>
                  </div>

                  {/* Card Info Rows */}
                  <div className="doc-card-body">
                    <div className="doc-info-row">
                      <Building2 size={15} className="doc-info-icon" />
                      <span>{doc.hospital}</span>
                    </div>

                    <div className="doc-info-row">
                      <MapPin size={15} className="doc-info-icon" />
                      <span>{doc.location}</span>
                    </div>

                    <div className="doc-info-row">
                      <Briefcase size={15} className="doc-info-icon" />
                      <span>{doc.experience} years experience</span>
                    </div>

                    <div className="doc-info-row">
                      <Star size={15} className="doc-rating-star" />
                      <div className="doc-rating-container">
                        <span className="doc-rating-value">{doc.rating}</span>
                        <span className="doc-reviews-count">({doc.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <div className="doc-info-row" style={{ justifyContent: "space-between" }}>
                      <span>Consultation Fee:</span>
                      <span className="doc-fee-value">₹{doc.consultationFee}</span>
                    </div>

                    <div className="doc-info-row" style={{ justifyContent: "space-between" }}>
                      <span>Availability:</span>
                      <span
                        className={`doc-availability-text ${
                          doc.availability.toLowerCase().includes("today") ? "today" : "tomorrow"
                        }`}
                      >
                        {doc.availability}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="doc-card-footer">
                    <Button variant="outline" onClick={() => setSelectedDoctorForModal(doc)}>
                      View Profile
                    </Button>
                    <Button variant="primary" onClick={() => handleBookAppointment(doc.name)}>
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-state">
              <Stethoscope size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">No doctors found</h3>
              <p className="empty-state-desc">
                We couldn't find any medical specialists matching your search queries or filter choices. Try changing or clearing your filters.
              </p>
              <Button variant="primary" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Doctor Profile Modal */}
      {selectedDoctorForModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDoctorForModal(null)}
          title="Doctor Profile"
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedDoctorForModal(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => {
                const name = selectedDoctorForModal.name;
                setSelectedDoctorForModal(null);
                handleBookAppointment(name);
              }}>
                Book Appointment
              </Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "var(--font-body)" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <div className="doc-avatar" style={{ width: "64px", height: "64px", fontSize: "22px" }}>
                {getInitials(selectedDoctorForModal.name)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: 0, fontSize: "18px", color: "var(--text-heading)", fontFamily: "var(--font-heading)" }}>
                  {selectedDoctorForModal.name}
                </h4>
                <span className="doc-specialty-badge" style={{ marginTop: "4px" }}>
                  {selectedDoctorForModal.specialty}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {selectedDoctorForModal.qualification}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13.5px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px" }}>Hospital</span>
                <strong style={{ color: "var(--text-heading)" }}>{selectedDoctorForModal.hospital}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px" }}>Location</span>
                <strong style={{ color: "var(--text-heading)" }}>{selectedDoctorForModal.location}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px" }}>Experience</span>
                <strong style={{ color: "var(--text-heading)" }}>{selectedDoctorForModal.experience} years</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px" }}>Consultation Fee</span>
                <strong style={{ color: "var(--text-heading)" }}>₹{selectedDoctorForModal.consultationFee}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px" }}>Rating & Reviews</span>
                <strong style={{ color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Star size={13} fill="var(--warning)" style={{ color: "var(--warning)" }} />
                  {selectedDoctorForModal.rating} ({selectedDoctorForModal.reviewCount} reviews)
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px" }}>Availability</span>
                <strong
                  className={`doc-availability-text ${
                    selectedDoctorForModal.availability.toLowerCase().includes("today") ? "today" : "tomorrow"
                  }`}
                >
                  {selectedDoctorForModal.availability}
                </strong>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "12px", marginBottom: "6px" }}>About Doctor</span>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>
                {selectedDoctorForModal.name} is a highly respected specialist in {selectedDoctorForModal.specialty} with over {selectedDoctorForModal.experience} years of clinical experience. Committed to providing exceptional and personalized patient care at {selectedDoctorForModal.hospital}, {selectedDoctorForModal.location}.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
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

export default DoctorList;
