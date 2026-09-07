import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, X, Building2, Loader2, AlertCircle } from "lucide-react";

import { api } from "../utils/api";
import Button from "../components/Button";
import Select from "../components/Select";
import Toast from "../components/Toast";
import DoctorCard from "../components/DoctorCard";
import SearchBox from "../components/SearchBox";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
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

// Specialty mapping for popular search chips
const specialtyMapping = {
  Dentist: "Dentist",
  Cardiologist: "Cardiology",
  Dermatologist: "Dermatology",
  Pediatrician: "Pediatrics",
  Gynecologist: "Gynecology",
  Orthopedic: "Orthopedics"
};

// Robust helper function to match specialties across naming variations
const matchSpecialty = (docSpecialty, selected) => {
  if (!selected || selected === "All") return true;
  const s1 = String(docSpecialty || "").toLowerCase().trim();
  const s2 = String(selected).toLowerCase().trim();

  if (s1 === s2) return true;
  if (s2 === "cardiology" && (s1.includes("cardio") || s1.includes("heart"))) return true;
  if (s2 === "pediatrics" && (s1.includes("pediatric") || s1.includes("child"))) return true;
  if (s2 === "dermatology" && (s1.includes("dermatolog") || s1.includes("skin"))) return true;
  if (s2 === "neurology" && (s1.includes("neurolog") || s1.includes("neuro"))) return true;
  if (s2 === "orthopedics" && (s1.includes("ortho") || s1.includes("bone"))) return true;
  if (s2 === "gynecology" && (s1.includes("gynec") || s1.includes("women"))) return true;
  if (s2 === "general physician" && (s1.includes("general") || s1.includes("physician") || s1.includes("medicine"))) return true;
  if (s2 === "dentist" && (s1.includes("dentist") || s1.includes("dental"))) return true;

  return s1.includes(s2) || s2.includes(s1);
};

// Normalize API response object into standard Doctor shape
const normalizeDoctor = (doc) => {
  const hospitalName = typeof doc.hospital === "object" && doc.hospital !== null
    ? doc.hospital.name
    : (typeof doc.hospital === "string" ? doc.hospital : "MediCare Hospital");

  const hospitalId = doc.hospitalId ?? (typeof doc.hospital === "object" && doc.hospital !== null ? doc.hospital.id : null);
  const spec = doc.specialization || doc.specialty || "General Physician";

  return {
    id: doc.id,
    userId: doc.userId ?? null,
    name: doc.name || "Dr. Medical",
    specialty: spec,
    specialization: spec,
    qualification: doc.qualification || "MBBS, MD",
    experience: typeof doc.experience === "number" ? doc.experience : (parseInt(doc.experience) || 0),
    email: doc.email || "",
    mobile: doc.mobile || "",
    consultationFee: doc.consultationFee ?? doc.fee ?? 500,
    fee: doc.consultationFee ?? doc.fee ?? 500,
    profileImage: doc.profileImage ?? null,
    location: doc.location || (typeof doc.hospital === "object" && doc.hospital !== null ? doc.hospital.location : "Chennai"),
    status: doc.status || "Active",
    hospital: hospitalName,
    hospitalId: hospitalId,
    // Safe frontend fallbacks for fields non-existent in backend DB:
    rating: doc.rating ?? 4.8,
    reviewCount: doc.reviewCount ?? 124,
    availability: doc.availability || "Available Today"
  };
};

function DoctorList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctorsFromApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/Doctors");
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch doctors");
      }
      const data = response.data;
      const normalized = (Array.isArray(data) ? data : []).map(normalizeDoctor);
      setDoctorsList(normalized);
    } catch (err) {
      console.error("Error fetching doctors from API:", err);
      setError("Unable to connect to the backend server. Please ensure the backend API is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch full doctors list from backend API on mount
  useEffect(() => {
    fetchDoctorsFromApi();
  }, []);

  // Search & Filter states
  const initialQuery = location.state?.query || "";
  const [searchVal, setSearchVal] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "success" });

  // Doctor profile modal state
  const [selectedProfileDoctor, setSelectedProfileDoctor] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Sorting and Pagination states
  const [sortBy, setSortBy] = useState("Relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Sync if location state query changes
  useEffect(() => {
    if (location.state?.query !== undefined) {
      setSearchVal(location.state.query);
      setSearchQuery(location.state.query);
      setCurrentPage(1);
    }
  }, [location.state]);

  // Generate hospital options dynamically from storage + doctor list
  const hospitalOptions = useMemo(() => {
    const hospitals = getHospitals();
    const map = new Map();

    hospitals.forEach((h) => {
      if (h.id && h.name) {
        map.set(String(h.id).toLowerCase(), h.name);
      }
    });

    doctorsList.forEach((d) => {
      if (d.hospitalId && d.hospital) {
        map.set(String(d.hospitalId).toLowerCase(), d.hospital);
      } else if (d.hospital) {
        const key = String(d.hospital).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!map.has(key)) map.set(key, d.hospital);
      }
    });

    const opts = Array.from(map.entries()).map(([id, name]) => ({
      value: id,
      label: name
    })).sort((a, b) => a.label.localeCompare(b.label));

    return [
      { value: "All", label: "All Hospitals" },
      ...opts
    ];
  }, [doctorsList]);

  // Generate location options dynamically from doctor list
  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(
      new Set(doctorsList.map((d) => d.location).filter(Boolean))
    ).sort();
    return [
      { value: "All", label: "All Locations" },
      ...uniqueLocations.map((loc) => ({ value: loc, label: loc }))
    ];
  }, [doctorsList]);

  // Combined filtering logic
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      // 1. Search filter: Match against name, specialty, hospital, or location
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        (doc.name && String(doc.name).toLowerCase().includes(query)) ||
        (doc.specialty && String(doc.specialty).toLowerCase().includes(query)) ||
        (doc.hospital && String(doc.hospital).toLowerCase().includes(query)) ||
        (doc.location && String(doc.location).toLowerCase().includes(query));

      // 2. Specialty filter
      const isSpecMatch = matchSpecialty(doc.specialty || doc.specialization, selectedSpecialty);

      // 3. Hospital filter
      const selectedHosObj = hospitalOptions.find((o) => o.value === selectedHospital);
      const targetHosName = selectedHosObj ? selectedHosObj.label.toLowerCase() : "";

      const matchesHospital =
        selectedHospital === "All" ||
        (doc.hospitalId && String(doc.hospitalId).toLowerCase() === String(selectedHospital).toLowerCase()) ||
        (doc.hospital && (
          String(doc.hospital).toLowerCase() === String(selectedHospital).toLowerCase() ||
          (targetHosName && String(doc.hospital).toLowerCase() === targetHosName)
        ));

      // 4. Location filter
      const matchesLocation =
        selectedLocation === "All" ||
        (doc.location && String(doc.location).toLowerCase() === selectedLocation.toLowerCase());

      return matchesSearch && isSpecMatch && matchesHospital && matchesLocation;
    });
  }, [doctorsList, searchQuery, selectedSpecialty, selectedHospital, selectedLocation, hospitalOptions]);

  // Sorting logic
  const sortedDoctors = useMemo(() => {
    const docsCopy = [...filteredDoctors];
    if (sortBy === "Rating") {
      return docsCopy.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    if (sortBy === "Experience") {
      return docsCopy.sort((a, b) => Number(b.experience || 0) - Number(a.experience || 0));
    }
    if (sortBy === "Fee: Low to High") {
      return docsCopy.sort(
        (a, b) =>
          Number(a.consultationFee ?? a.fee ?? 0) - Number(b.consultationFee ?? b.fee ?? 0)
      );
    }
    if (sortBy === "Fee: High to Low") {
      return docsCopy.sort(
        (a, b) =>
          Number(b.consultationFee ?? b.fee ?? 0) - Number(a.consultationFee ?? a.fee ?? 0)
      );
    }
    return docsCopy; // Relevance
  }, [filteredDoctors, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedDoctors.length / ITEMS_PER_PAGE);
  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedDoctors, currentPage]);

  // Group paginated doctors visually by BOTH hospital AND location branch
  const groupedDoctors = useMemo(() => {
    const map = new Map();
    paginatedDoctors.forEach((doc) => {
      const hosId = doc.hospitalId || doc.hospital || "MediCare Hospital";
      const hosName = doc.hospital || "MediCare Hospital";
      const docLoc = doc.location || "Chennai";

      // Combined key ensures branch-level grouping by hospital + location
      const groupKey = `${String(hosId).toLowerCase()}_${String(docLoc).toLowerCase()}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          hospitalName: hosName,
          hospitalId: hosId,
          location: docLoc,
          doctors: []
        });
      }
      map.get(groupKey).doctors.push(doc);
    });
    return Array.from(map.values());
  }, [paginatedDoctors]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Check if any filters are currently active
  const isFiltersActive = useMemo(() => {
    return searchQuery.trim() !== "" || selectedSpecialty !== "All" || selectedHospital !== "All" || selectedLocation !== "All";
  }, [searchQuery, selectedSpecialty, selectedHospital, selectedLocation]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchVal("");
    setSearchQuery("");
    setSelectedSpecialty("All");
    setSelectedHospital("All");
    setSelectedLocation("All");
    setSortBy("Relevance");
    setCurrentPage(1);
  };

  // Search input change handler - update live query as well as form state
  const handleSearchChange = (val) => {
    setSearchVal(val);
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Specialty select handler
  const handleSpecialtyChange = (e) => {
    const val = e.target.value;
    setSelectedSpecialty(val);
    setCurrentPage(1);
  };

  // Hospital select handler
  const handleHospitalChange = (e) => {
    const val = e.target.value;
    setSelectedHospital(val);
    setCurrentPage(1);
  };

  // Location select handler
  const handleLocationChange = (e) => {
    const val = e.target.value;
    setSelectedLocation(val);
    setCurrentPage(1);
  };

  // Search form submit handler
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchVal);
    setCurrentPage(1);
  };

  // Popular search chip click handler
  const handlePopularSearchClick = (chip) => {
    const mappedSpec = specialtyMapping[chip] || chip;
    setSearchVal("");
    setSearchQuery("");
    setSelectedSpecialty(mappedSpec);
    setSelectedHospital("All");
    setSelectedLocation("All");
    setCurrentPage(1);
  };

  // Fetch individual doctor profile details from backend API on View Profile click
  const handleViewProfile = async (doc) => {
    if (!doc || !doc.id) return;
    setIsProfileModalOpen(true);
    setProfileLoading(true);
    setProfileError(null);
    setSelectedProfileDoctor(null);

    try {
      const response = await api.get(`/Doctors/${doc.id}`);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch doctor profile");
      }
      const data = response.data;
      const normalized = normalizeDoctor(data);
      setSelectedProfileDoctor(normalized);
    } catch (err) {
      console.error(`Error fetching profile for doctor ID ${doc.id}:`, err);
      setProfileError(`Unable to fetch doctor profile from backend API.`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBookAppointment = (doc) => {
    navigate("/book-appointment", { state: { doctor: doc } });
  };

  return (
    <>
      <main className="doctors-content">
        {/* Page Header */}
        <PageHeader
          title="Find Doctor"
          subtitle="Search and book an appointment with trusted doctors."
        />

        {/* Filters Bar */}
        <section className="filters-bar">
          <form onSubmit={handleSearchSubmit} className="filters-row">
            {/* Search Input Box */}
            <div className="filter-search-wrapper">
              <SearchBox
                value={searchVal}
                onChange={handleSearchChange}
                placeholder="Search by doctor name, specialty, hospital or city..."
              />
            </div>

            {/* Specialty Dropdown Filter */}
            <div className="filter-select-wrapper">
              <Select
                value={selectedSpecialty}
                onChange={handleSpecialtyChange}
                options={specialtyOptions}
                placeholder="All Specialties"
              />
            </div>

            {/* Hospital Dropdown Filter */}
            <div className="filter-select-wrapper">
              <Select
                value={selectedHospital}
                onChange={handleHospitalChange}
                options={hospitalOptions}
                placeholder="All Hospitals"
              />
            </div>

            {/* Location Dropdown Filter */}
            <div className="filter-select-wrapper">
              <Select
                value={selectedLocation}
                onChange={handleLocationChange}
                options={locationOptions}
                placeholder="All Locations"
              />
            </div>

            {/* Search Action Button */}
            <div className="filter-btn-wrapper">
              <Button type="submit" variant="primary">Search</Button>
            </div>
          </form>

          {/* Clear Filters Button */}
          {isFiltersActive && (
            <div className="clear-filters-btn-wrapper">
              <button className="btn-link" onClick={handleClearFilters}>
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Popular Search Chips */}
        <section className="popular-searches-section">
          <span className="popular-searches-label">Popular Searches:</span>
          <div className="popular-chips-container">
            {["Dentist", "Cardiologist", "Dermatologist", "Pediatrician", "Gynecologist", "Orthopedic"].map((chip) => {
              const mapped = specialtyMapping[chip] || chip;
              const isActive = selectedSpecialty.toLowerCase() === mapped.toLowerCase();
              return (
                <button
                  key={chip}
                  className={`popular-chip ${isActive ? "active" : ""}`}
                  onClick={() => handlePopularSearchClick(chip)}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Header & Sorting */}
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

        {/* Doctors Grid / Grouped by Hospital / Loading / Error / Empty State */}
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
              <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
                Loading doctors from backend server...
              </p>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : error ? (
            <EmptyState
              title="Backend API Error"
              description={error}
              icon={AlertCircle}
              actionLabel="Retry Connection"
              onAction={fetchDoctorsFromApi}
            />
          ) : groupedDoctors.length > 0 ? (
            groupedDoctors.map((group) => (
              <div key={group.key} className="hospital-doctor-group">
                <div className="hospital-group-header">
                  <Building2 size={20} className="hospital-header-icon" />
                  <span className="hospital-header-title">{group.hospitalName}</span>
                  <span className="hospital-header-location">• {group.location}</span>
                  <span className="hospital-header-count">
                    {group.doctors.length} {group.doctors.length === 1 ? "Doctor" : "Doctors"}
                  </span>
                </div>

                <div className="doctors-list-grid">
                  {group.doctors.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      onViewProfile={(d) => handleViewProfile(d)}
                      onBook={(d) => handleBookAppointment(d)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No Doctors Found"
              description="We couldn't find any medical specialists matching your search query or selected filters."
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

      {/* Doctor Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Doctor Profile Details"
      >
        {profileLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: "12px" }}>
            <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
              Loading doctor profile...
            </p>
          </div>
        ) : profileError ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "12px 0" }}>
            <EmptyState
              title="Profile Load Failed"
              description={profileError}
              icon={AlertCircle}
            />
            <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : selectedProfileDoctor ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header Profile Section */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
              <div className="doctor-card-avatar" style={{ width: "64px", height: "64px", fontSize: "22px" }}>
                {(selectedProfileDoctor.name || "DR")
                  .split(" ")
                  .filter((n) => n.toLowerCase() !== "dr.")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase() || "DR"}
              </div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "var(--text-heading)" }}>
                  {selectedProfileDoctor.name.toLowerCase().startsWith("dr.") ? selectedProfileDoctor.name : `Dr. ${selectedProfileDoctor.name}`}
                </h2>
                <div style={{ color: "var(--primary)", fontWeight: "600", fontSize: "14px", marginTop: "2px" }}>
                  {selectedProfileDoctor.specialty || selectedProfileDoctor.specialization}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  {selectedProfileDoctor.qualification || "MBBS, MD"}
                </div>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>HOSPITAL / CLINIC</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedProfileDoctor.hospital || "MediCare Hospital"}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>LOCATION</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedProfileDoctor.location || "Chennai"}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>EXPERIENCE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedProfileDoctor.experience} {typeof selectedProfileDoctor.experience === 'number' ? 'yrs experience' : ''}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CONSULTATION FEE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--primary)", marginTop: "4px" }}>
                  ₹{selectedProfileDoctor.consultationFee ?? selectedProfileDoctor.fee ?? 800}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>RATING</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#a16207", marginTop: "4px" }}>
                  ⭐ {selectedProfileDoctor.rating || 4.8} ({selectedProfileDoctor.reviewCount || 124} reviews)
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>AVAILABILITY</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--success, #16a34a)", marginTop: "4px" }}>
                  {selectedProfileDoctor.availability || "Available Today"}
                </div>
              </div>

              {selectedProfileDoctor.email && (
                <div>
                  <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>EMAIL</label>
                  <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                    {selectedProfileDoctor.email}
                  </div>
                </div>
              )}

              {selectedProfileDoctor.mobile && (
                <div>
                  <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>MOBILE</label>
                  <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                    {selectedProfileDoctor.mobile}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="form-actions" style={{ display: "flex", gap: "12px", marginTop: "12px", justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  handleBookAppointment(selectedProfileDoctor);
                }}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

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
