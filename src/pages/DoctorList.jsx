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
import { getDoctors, getCurrentUser } from "../utils/storage";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Toast from "../components/Toast";
import DoctorCard from "../components/DoctorCard";
import SearchBox from "../components/SearchBox";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
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

// Patient info for Navbar (dynamic from current user now)

// Specialty mapping for popular search chips
const specialtyMapping = {
  "Dentist": "Dentist",
  "Cardiologist": "Cardiology",
  "Dermatologist": "Dermatology",
  "Pediatrician": "Pediatrics",
  "Gynecologist": "Gynecology",
  "Orthopedic": "Orthopedics"
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
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [doctorsList, setDoctorsList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setDoctorsList(getDoctors());
    setCurrentUser(getCurrentUser());
  }, []);

  // Sorting and Pagination states
  const [sortBy, setSortBy] = useState("Relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Update filter values if incoming router state changes
  useEffect(() => {
    if (location.state?.query !== undefined) {
      setSearchVal(location.state.query);
      setSearchQuery(location.state.query);
    }
  }, [location.state]);

  // Generate location options dynamically from mock doctor data
  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(new Set(doctorsList.map((d) => d.location)));
    return [
      { value: "All", label: "All Locations" },
      ...uniqueLocations.map((loc) => ({ value: loc, label: loc }))
    ];
  }, [doctorsList]);

  // Combined filtering logic using useMemo
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
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
  }, [doctorsList, searchQuery, selectedSpecialty, selectedLocation]);

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
    const mappedSpec = specialtyMapping[spec] || spec;
    setSearchVal("");
    setSpecialtyVal(mappedSpec);
    setLocationVal("All");
    
    setSearchQuery("");
    setSelectedSpecialty(mappedSpec);
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

  const handleBookAppointment = (doc) => {
    navigate("/book-appointment", { state: { doctor: doc } });
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

  return (
    <>
      <main className="doctors-content">
          {/* Page Header */}
          <PageHeader
            title="Find Doctor"
            subtitle="Search and book an appointment with trusted doctors."
          />

          {/* Filters Panel */}
          <section className="filters-bar">
            <form onSubmit={handleSearchSubmit} className="filters-row">
              {/* Search Box Component */}
              <div className="filter-search-wrapper">
                <SearchBox
                  value={searchVal}
                  onChange={(val) => setSearchVal(val)}
                  placeholder="Search doctors..."
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
              {["Dentist", "Cardiologist", "Dermatologist", "Pediatrician", "Gynecologist", "Orthopedic"].map((spec) => {
                const mapped = specialtyMapping[spec] || spec;
                const isActive = selectedSpecialty.toLowerCase() === mapped.toLowerCase();
                return (
                  <button
                    key={spec}
                    className={`popular-chip ${isActive ? "active" : ""}`}
                    onClick={() => handlePopularSearchClick(spec)}
                  >
                    {spec}
                  </button>
                );
              })}
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
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onViewProfile={(d) => navigate("/doctor-profile", { state: { doctor: d } })}
                    onBook={(d) => handleBookAppointment(d)}
                  />
                ))}
              </div>
            ) : (
              /* Reusable Empty State */
              <EmptyState
                title="No Doctors Found"
                description="We couldn't find any medical specialists matching your search queries or filter choices."
                icon={Stethoscope}
                actionLabel="Clear All Filters"
                onAction={handleClearFilters}
              />
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
    </>
  );
}

export default DoctorList;
