import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, X } from "lucide-react";
import { getDoctors } from "../utils/storage";
import Button from "../components/Button";
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

function DoctorList() {
  const location = useLocation();
  const navigate = useNavigate();

  const [doctorsList, setDoctorsList] = useState([]);

  // Fetch full doctors list from storage on mount
  useEffect(() => {
    const docs = getDoctors();
    setDoctorsList(docs);
  }, []);

  // Search & Filter states
  const initialQuery = location.state?.query || "";
  const [searchVal, setSearchVal] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "success" });

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

      // 3. Location filter
      const matchesLocation =
        selectedLocation === "All" ||
        (doc.location && String(doc.location).toLowerCase() === selectedLocation.toLowerCase());

      return matchesSearch && isSpecMatch && matchesLocation;
    });
  }, [doctorsList, searchQuery, selectedSpecialty, selectedLocation]);

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

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Check if any filters are currently active
  const isFiltersActive = useMemo(() => {
    return searchQuery.trim() !== "" || selectedSpecialty !== "All" || selectedLocation !== "All";
  }, [searchQuery, selectedSpecialty, selectedLocation]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchVal("");
    setSearchQuery("");
    setSelectedSpecialty("All");
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
    setSelectedLocation("All");
    setCurrentPage(1);
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

        {/* Doctors Grid / Empty State */}
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {paginatedDoctors.length > 0 ? (
            <div className="doctors-list-grid">
              {paginatedDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onBook={(d) => handleBookAppointment(d)}
                />
              ))}
            </div>
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
