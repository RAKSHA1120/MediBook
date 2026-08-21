import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Heart,
  LayoutDashboard,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Calendar
} from "lucide-react";
import doctors from "../data/doctors";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Toast from "../components/Toast";
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
  const navigate = useNavigate();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search & Filter states
  const [searchVal, setSearchVal] = useState(location.state?.query || "");
  const [specialtyVal, setSpecialtyVal] = useState("All");
  const [locationVal, setLocationVal] = useState("All");

  // Applied filter states
  const [searchQuery, setSearchQuery] = useState(location.state?.query || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  // Sorting and Pagination states
  const [sortBy, setSortBy] = useState("Relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Toast States
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  // Update filter values if incoming router state changes
  useEffect(() => {
    if (location.state?.query !== undefined) {
      setSearchVal(location.state.query);
      setSearchQuery(location.state.query);
    }
  }, [location.state]);

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
      // 1. Search filter: Match against name, specialty, or hospital
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query) ||
        doc.hospital.toLowerCase().includes(query);

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

  // Sorting logic using useMemo
  const sortedDoctors = useMemo(() => {
    const docsCopy = [...filteredDoctors];
    if (sortBy === "Rating") {
      return docsCopy.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "Experience") {
      return docsCopy.sort((a, b) => b.experience - a.experience);
    }
    if (sortBy === "Fee: Low to High") {
      return docsCopy.sort((a, b) => a.consultationFee - b.consultationFee);
    }
    if (sortBy === "Fee: High to Low") {
      return docsCopy.sort((a, b) => b.consultationFee - a.consultationFee);
    }
    return docsCopy; // Relevance
  }, [filteredDoctors, sortBy]);

  // Pagination bounds calculation
  const totalPages = Math.ceil(sortedDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedDoctors, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Smooth scroll to top of content area on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Check if any filters are active
  const isFiltersActive = useMemo(() => {
    return searchQuery.trim() !== "" || selectedSpecialty !== "All" || selectedLocation !== "All";
  }, [searchQuery, selectedSpecialty, selectedLocation]);

  // Reset all filters to default
  const handleClearFilters = () => {
    setSearchVal("");
    setSpecialtyVal("All");
    setLocationVal("All");
    setSearchQuery("");
    setSelectedSpecialty("All");
    setSelectedLocation("All");
    setSortBy("Relevance");
    setCurrentPage(1);
    showNotification("Filters Reset", "All search filters have been cleared.", "info");
  };

  // Submit search form
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchVal);
    setSelectedSpecialty(specialtyVal);
    setSelectedLocation(locationVal);
    setCurrentPage(1);
  };

  // Handle Popular Search chip click
  const handlePopularSearchClick = (spec) => {
    setSearchVal("");
    setSpecialtyVal(spec);
    setLocationVal("All");
    
    setSearchQuery("");
    setSelectedSpecialty(spec);
    setSelectedLocation("All");
    setCurrentPage(1);
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
          
          <button className="patient-sidebar-item active" onClick={() => setIsSidebarOpen(false)}>
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
      <div className="doctors-page-main">
        {/* Header / Navbar */}
        <Navbar
          userName={patient.name}
          userRole={patient.role}
          avatarLetter={patient.avatarLetter}
          hideTabs={true}
          hideSearch={true}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="doctors-content">
          {/* Page Title & Subtitle */}
          <section className="doctors-page-header">
            <h2 className="doctors-page-title">Find Doctor</h2>
            <p className="doctors-page-subtitle">
              Search and book an appointment with trusted doctors.
            </p>
          </section>

          {/* Filters Panel */}
          <section className="filters-bar">
            <form onSubmit={handleSearchSubmit} className="filters-row">
              {/* Search Input */}
              <div className="filter-search-wrapper">
                <Input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  icon={Search}
                />
              </div>

              {/* Specialty Dropdown */}
              <div className="filter-select-wrapper">
                <Select
                  value={specialtyVal}
                  onChange={(e) => setSpecialtyVal(e.target.value)}
                  options={specialtyOptions}
                  placeholder="All Specialties"
                />
              </div>

              {/* Location Dropdown */}
              <div className="filter-select-wrapper">
                <Select
                  value={locationVal}
                  onChange={(e) => setLocationVal(e.target.value)}
                  options={locationOptions}
                  placeholder="All Locations"
                />
              </div>

              {/* Search Submit Button */}
              <div className="filter-btn-wrapper">
                <Button type="submit" variant="primary">Search</Button>
              </div>
            </form>

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

          {/* Popular Searches */}
          <section className="popular-searches-section">
            <span className="popular-searches-label">Popular Searches:</span>
            <div className="popular-chips-container">
              {["Dentist", "Cardiologist", "Dermatologist", "Pediatrician", "Gynecologist", "Orthopedic"].map((spec) => (
                <button
                  key={spec}
                  className={`popular-chip ${selectedSpecialty.toLowerCase() === spec.toLowerCase() ? "active" : ""}`}
                  onClick={() => handlePopularSearchClick(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </section>

          {/* Results Header */}
          <section className="results-header-section">
            <div className="results-count-text">
              <strong>{filteredDoctors.length}</strong> {filteredDoctors.length === 1 ? "Doctor" : "Doctors"} found
            </div>
            <div className="results-sort-container">
              <span className="sort-label">Sort by:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="Relevance">Relevance</option>
                <option value="Rating">Rating</option>
                <option value="Experience">Experience</option>
                <option value="Fee: Low to High">Fee: Low to High</option>
                <option value="Fee: High to Low">Fee: High to Low</option>
              </select>
            </div>
          </section>

          {/* Doctors Grid / Empty State */}
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            {paginatedDoctors.length > 0 ? (
              <div className="doctors-list-grid">
                {paginatedDoctors.map((doc) => (
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
                      <Button variant="outline" onClick={() => navigate("/doctor-profile", { state: { doctor: doc } })}>
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

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className={`pagination-btn prev-btn ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`pagination-btn page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                className={`pagination-btn next-btn ${currentPage === totalPages ? "disabled" : ""}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </main>
      </div>

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
