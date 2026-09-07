import { useState, useEffect, useMemo } from "react";
import { Eye, EyeOff, Edit, MoreVertical, Building2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal";
import Input from "../components/Input";
import StatusBadge from "../components/StatusBadge";
import { api } from "../utils/api";
import { generateLoginId, generatePassword } from "../utils/idGenerator";
import "./AdminDoctors.css";
import "./AdminShared.css";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [hospitalFilter, setHospitalFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchDoctors = async () => {
    try {
      const response = await api.get("/Doctors");
      if (response.success) {
        setDoctors(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching doctors", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Close options popover on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".more-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Form State for Adding Doctor
  const [addFormData, setAddFormData] = useState({
    name: "",
    qualification: "MBBS, MD",
    specialization: "Cardiology",
    hospital: "",
    experience: "",
    email: "",
    phone: "",
    dob: ""
  });

  // Form State for Editing Doctor
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    qualification: "",
    specialization: "",
    hospital: "",
    experience: "",
    email: "",
    phone: "",
    contact: "",
    status: "Active",
    loginId: ""
  });

  const handleSearchChange = (val) => {
    if (typeof val === "string") {
      setSearchTerm(val);
    } else if (val && val.target) {
      setSearchTerm(val.target.value || "");
    } else {
      setSearchTerm("");
    }
  };

  const getHospitalName = (d) => {
    if (!d) return "MediCare Hospital";
    if (typeof d.hospital === "object" && d.hospital !== null) return d.hospital.name || "MediCare Hospital";
    return d.hospitalName || d.hospital || "MediCare Hospital";
  };

  // Derive unique specializations & hospitals for dropdown filters
  const specializationOptions = useMemo(() => {
    const specs = doctors.map(d => d.specialization || d.specialty).filter(Boolean);
    return [...new Set(specs)].sort();
  }, [doctors]);

  const hospitalOptions = useMemo(() => {
    const hosps = doctors.map(d => getHospitalName(d)).filter(Boolean);
    return [...new Set(hosps)].sort();
  }, [doctors]);

  // Handle Add Doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const dobYear = addFormData.dob ? addFormData.dob.split("-")[0] : "1985";
    const loginId = generateLoginId(addFormData.name, dobYear, doctors);
    const password = generatePassword(addFormData.name, dobYear);

    // 1. Create User
    const userRes = await api.post("/Users", {
      name: addFormData.name.trim(),
      email: addFormData.email.trim(),
      password: password,
      role: "doctor"
    });

    if (!userRes.success) {
      alert("Failed to create user account for doctor.");
      return;
    }

    // 2. Create Doctor
    const newDoc = {
      userId: userRes.data.id,
      name: addFormData.name.trim(),
      specialty: addFormData.specialization.trim() || "General Medicine",
      experience: parseInt(addFormData.experience.trim()) || 5,
      email: addFormData.email.trim(),
      phone: addFormData.phone.trim(),
      isActive: true,
      hospitalId: 1 // Default or we need hospital selection
    };

    const docRes = await api.post("/Doctors", newDoc);
    if (docRes.success) {
      fetchDoctors();
      setNewCredentials({ name: addFormData.name, loginId: addFormData.email.trim(), password });
      setIsAddModalOpen(false);
      setIsSuccessModalOpen(true);
      setAddFormData({
        name: "",
        qualification: "MBBS, MD",
        specialization: "Cardiology",
        hospital: "",
        experience: "",
        email: "",
        phone: "",
        dob: ""
      });
    } else {
      alert("Failed to create doctor profile.");
    }
  };

  // Open Edit Modal with Pre-filled Doctor Details
  const handleOpenEdit = (doc) => {
    setEditFormData({
      id: doc.id,
      name: doc.name || "",
      qualification: doc.qualification || "MBBS, MD",
      specialization: doc.specialization || doc.specialty || "General Medicine",
      hospital: getHospitalName(doc),
      experience: doc.experience !== undefined ? String(doc.experience).replace(/[^0-9]/g, "") : "",
      email: doc.email || "",
      phone: doc.contact || doc.phone || "",
      contact: doc.contact || doc.phone || "",
      status: doc.status || "Active",
      loginId: doc.loginId || ""
    });
    setIsEditModalOpen(true);
  };

  // Handle Update Doctor
  const handleSaveEditDoctor = async (e) => {
    e.preventDefault();
    const updates = {
      id: editFormData.id,
      userId: selectedDoctor.userId,
      hospitalId: selectedDoctor.hospitalId || 1,
      name: editFormData.name.trim(),
      specialty: editFormData.specialization.trim(),
      experience: parseInt(editFormData.experience.trim()) || 0,
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      isActive: editFormData.status === "Active"
    };

    const response = await api.put(`/Doctors/${editFormData.id}`, updates);
    if (response.success || response.status === 204) {
      fetchDoctors();
    } else {
      alert("Failed to update doctor.");
    }
    setIsEditModalOpen(false);
    if (selectedDoctor && selectedDoctor.id === editFormData.id) {
      setSelectedDoctor({ ...selectedDoctor, ...updates });
    }
  };

  // Toggle Doctor Status (Active / Inactive)
  const handleToggleStatus = async (doc) => {
    const newStatus = doc.status === "Active" ? "Inactive" : "Active";
    
    const updates = {
      id: doc.id,
      userId: doc.userId,
      hospitalId: doc.hospitalId || 1,
      name: doc.name,
      specialty: doc.specialization || doc.specialty,
      experience: doc.experience,
      email: doc.email,
      phone: doc.mobile || doc.phone,
      isActive: newStatus === "Active"
    };

    const response = await api.put(`/Doctors/${doc.id}`, updates);
    if (response.success || response.status === 204) {
      fetchDoctors();
    } else {
      alert("Failed to update status.");
    }
    if (selectedDoctor && selectedDoctor.id === doc.id) {
      setSelectedDoctor({ ...selectedDoctor, status: newStatus });
    }
  };

  // Handle Delete Doctor
  const handleDeleteDoctor = async (doc) => {
    const cleanName = doc.name ? doc.name.replace(/^(dr\.|dr\s)/i, '').trim() : "Doctor";
    if (window.confirm(`Are you sure you want to remove Dr. ${cleanName} from the medical network?`)) {
      const response = await api.delete(`/Doctors/${doc.id}`);
      if (response.success || response.status === 204 || response.status === 404) {
        fetchDoctors();
      } else {
        alert("Failed to delete doctor.");
      }
      if (selectedDoctor && selectedDoctor.id === doc.id) {
        setIsViewModalOpen(false);
        setSelectedDoctor(null);
      }
    }
  };

  // Combined Filter logic
  const filteredDoctors = doctors.filter(doc => {
    const query = searchTerm.toLowerCase().trim();
    const docName = (doc.name || "").toLowerCase();
    const docSpec = (doc.specialization || doc.specialty || "").toLowerCase();
    const docHosp = String(getHospitalName(doc)).toLowerCase();
    const docId = String(doc.loginId || "").toLowerCase();

    const matchesSearch = !query || docName.includes(query) || docSpec.includes(query) || docHosp.includes(query) || docId.includes(query);
    const matchesSpec = specFilter === "All" || (doc.specialization || doc.specialty) === specFilter;
    const matchesHosp = hospitalFilter === "All" || getHospitalName(doc) === hospitalFilter;
    const matchesStatus = statusFilter === "All" || (doc.status || "Active") === statusFilter;

    return matchesSearch && matchesSpec && matchesHosp && matchesStatus;
  });

  const formatExperience = (exp) => {
    if (exp === undefined || exp === null || exp === "") return "0 yrs";
    const num = String(exp).replace(/[^0-9]/g, "").trim();
    return num ? `${num} yrs` : `${exp} yrs`;
  };

  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Doctor Management" 
        subtitle="Manage registered medical practitioners, specializations, and account credentials"
      >
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          Add New Doctor
        </Button>
      </PageHeader>

      <div className="admin-table-card">
        {/* Compact Search & Filters Toolbar */}
        <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: "12px", padding: "12px 20px" }}>
          <div style={{ flex: "1 1 300px", minWidth: "260px" }}>
            <SearchBox 
              placeholder="Search doctors by name, specialty or hospital..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Specialization Filter */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
            >
              <option value="All">All Specializations</option>
              {specializationOptions.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Hospital Filter */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
            >
              <option value="All">All Hospitals</option>
              {hospitalOptions.map(hosp => (
                <option key={hosp} value={hosp}>{hosp}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "28%" }}>DOCTOR</th>
                <th style={{ width: "18%" }}>SPECIALIZATION</th>
                <th style={{ width: "22%" }}>HOSPITAL</th>
                <th style={{ width: "12%" }}>EXPERIENCE</th>
                <th style={{ width: "10%" }}>STATUS</th>
                <th style={{ width: "10%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doc => {
                const rawName = doc.name || "Doctor";
                const cleanName = rawName.replace(/^(dr\.|dr\s)/i, '').trim();
                const qual = doc.qualification || "MBBS, MD";
                const spec = doc.specialization || doc.specialty || "General Medicine";

                return (
                  <tr key={doc.id}>
                    {/* DOCTOR: Avatar, Name, Qualification */}
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar" style={{ background: "rgba(47, 111, 163, 0.1)", color: "var(--primary)" }}>
                          {cleanName.charAt(0)}
                        </div>
                        <div className="user-details">
                          <span className="user-name" style={{ fontSize: "14px", fontWeight: "600" }}>
                            Dr. {cleanName}
                          </span>
                          <span className="user-subtext" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {qual}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SPECIALIZATION */}
                    <td>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {spec}
                      </span>
                    </td>

                    {/* HOSPITAL */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-heading)", fontWeight: "500", fontSize: "13.5px" }} title={getHospitalName(doc)}>
                        <Building2 size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                          {getHospitalName(doc)}
                        </span>
                      </div>
                    </td>

                    {/* EXPERIENCE */}
                    <td>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {formatExperience(doc.experience)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="nowrap">
                      <StatusBadge status={doc.status || "Active"} />
                    </td>

                    {/* ACTIONS */}
                    <td className="nowrap text-right" style={{ textAlign: "right" }}>
                      <div className="table-actions-cell">
                        {/* View Button */}
                        <button
                          className="icon-action-btn"
                          title="View Doctor"
                          onClick={() => { setSelectedDoctor(doc); setIsViewModalOpen(true); }}
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit Button */}
                        <button
                          className="icon-action-btn"
                          title="Edit Doctor"
                          onClick={() => handleOpenEdit(doc)}
                        >
                          <Edit size={17} />
                        </button>

                        {/* More Menu Dropdown */}
                        <div className="more-menu-container">
                          <button
                            className={`icon-action-btn ${openMenuId === doc.id ? "active" : ""}`}
                            title="More options"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                            }}
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenuId === doc.id && (
                            <div className="more-menu-dropdown">
                              <button
                                className="more-menu-item"
                                onClick={() => {
                                  handleToggleStatus(doc);
                                  setOpenMenuId(null);
                                }}
                              >
                                {doc.status === "Active" ? "Disable Doctor" : "Enable Doctor"}
                              </button>
                              <button
                                className="more-menu-item danger"
                                onClick={() => {
                                  handleDeleteDoctor(doc);
                                  setOpenMenuId(null);
                                }}
                              >
                                Delete Doctor
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-xl text-gray" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No doctors found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Doctor Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Doctor"
        className="hospital-modal-container"
      >
        <form onSubmit={handleAddDoctor} className="hospital-form">
          <div className="form-group">
            <label className="form-label">Doctor Name *</label>
            <input
              type="text"
              className="form-input"
              value={addFormData.name}
              onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              placeholder="e.g. Arun Kumar"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Qualification *</label>
              <input
                type="text"
                className="form-input"
                value={addFormData.qualification}
                onChange={(e) => setAddFormData({ ...addFormData, qualification: e.target.value })}
                placeholder="e.g. MBBS, MD"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-input"
                value={addFormData.specialization}
                onChange={(e) => setAddFormData({ ...addFormData, specialization: e.target.value })}
                placeholder="e.g. Cardiology"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hospital / Clinic *</label>
              <input
                type="text"
                className="form-input"
                value={addFormData.hospital}
                onChange={(e) => setAddFormData({ ...addFormData, hospital: e.target.value })}
                placeholder="e.g. MediCare Hospital"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years) *</label>
              <input
                type="text"
                className="form-input"
                value={addFormData.experience}
                onChange={(e) => setAddFormData({ ...addFormData, experience: e.target.value })}
                placeholder="e.g. 12"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                placeholder="e.g. doctor@hospital.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-input"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                placeholder="e.g. +91 9876543210"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={addFormData.dob}
              onChange={(e) => setAddFormData({ ...addFormData, dob: e.target.value })}
            />
          </div>
          
          <div className="form-actions">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Doctor Account</Button>
          </div>
        </form>
      </Modal>

      {/* View Doctor Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        title="Doctor Details"
        className="hospital-modal-container"
      >
        {selectedDoctor && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>DOCTOR NAME</label>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-heading)", marginTop: "4px" }}>
                  Dr. {(selectedDoctor.name || "Doctor").replace(/^(dr\.|dr\s)/i, '').trim()}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>LOGIN ID</label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--primary)", marginTop: "4px" }}>
                  {selectedDoctor.loginId || "N/A"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>QUALIFICATION</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedDoctor.qualification || "MBBS, MD"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>SPECIALIZATION</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedDoctor.specialization || selectedDoctor.specialty || "General Medicine"}
                </div>
              </div>
              <div className="detail-item">
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>HOSPITAL</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  <Building2 size={16} style={{ color: "var(--primary)" }} />
                  {getHospitalName(selectedDoctor)}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>EXPERIENCE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {formatExperience(selectedDoctor.experience)}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>STATUS</label>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={selectedDoctor.status || "Active"} />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CONTACT NUMBER</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedDoctor.contact || selectedDoctor.phone || "N/A"}
                </div>
              </div>
            </div>

            {selectedDoctor.email && (
              <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
                <div style={{ fontSize: "14px", color: "var(--text-heading)", marginTop: "4px" }}>{selectedDoctor.email}</div>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: "8px" }}>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => { setIsViewModalOpen(false); handleOpenEdit(selectedDoctor); }}>Edit Doctor</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Doctor Details"
        className="hospital-modal-container"
      >
        <form onSubmit={handleSaveEditDoctor} className="hospital-form">
          <div className="form-group">
            <label className="form-label">Doctor Name *</label>
            <input
              type="text"
              className="form-input"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Qualification *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.qualification}
                onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.specialization}
                onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hospital / Clinic *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.hospital}
                onChange={(e) => setEditFormData({ ...editFormData, hospital: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (Years) *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.experience}
                onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Login ID</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.loginId}
                disabled
                style={{ backgroundColor: "var(--background)", opacity: 0.8 }}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Credentials Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Doctor Account Created Successfully"
      >
        {newCredentials && (
          <div className="credentials-container">
            <p className="success-message">
              The account for <strong>{newCredentials.name}</strong> has been created. Please share these credentials securely.
            </p>
            
            <div className="credential-box">
              <div className="credential-row">
                <span className="credential-label">Login ID:</span>
                <span className="credential-value">{newCredentials.loginId}</span>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(newCredentials.loginId)}>
                  Copy ID
                </Button>
              </div>
              <div className="credential-row">
                <span className="credential-label">Temporary Password:</span>
                <span className="credential-value password-value">{newCredentials.password}</span>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(newCredentials.password)}>
                  Copy Password
                </Button>
              </div>
            </div>

            <div className="modal-actions">
              <Button variant="primary" onClick={() => setIsSuccessModalOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminDoctors;
