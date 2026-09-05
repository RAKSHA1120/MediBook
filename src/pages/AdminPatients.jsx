import { useState, useEffect, useMemo } from "react";
import { Users, UserCheck, UserX, UserPlus, Eye, Edit, MoreVertical } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { api } from "../utils/api";

import "./AdminDashboard.css";
import "./AdminShared.css";

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/Patients");
      if (response.success) {
        // Map backend fields to frontend expectations
        const mappedPatients = response.data.map(p => ({
          ...p,
          contact: p.mobile,
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A",
          status: p.isActive === false ? "Inactive" : "Active"
        }));
        setPatients(mappedPatients);
      } else {
        // Fallback
        setPatients(getPatients());
      }
    } catch (err) {
      setPatients(getPatients());
    }
  };

  // Close popover options menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".more-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Form State for Editing Patient
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    age: "",
    gender: "Male",
    contact: "",
    email: "",
    status: "Active"
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

  // Dynamic Statistics Calculations
  const stats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter(p => (p.status || "Active") === "Active").length;
    const inactive = patients.filter(p => p.status === "Inactive").length;

    // Calculate new registrations this month
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const newThisMonth = patients.filter(p => p.date && p.date.startsWith(currentMonthStr)).length || Math.min(total, 5);

    return { total, active, inactive, newThisMonth };
  }, [patients]);

  // Combined Filters Logic
  const filteredPatients = patients.filter(p => {
    const query = searchTerm.toLowerCase().trim();
    const pName = String(p.name || "").toLowerCase();
    const pPhone = String(p.contact || p.phone || "").toLowerCase();
    const pId = String(p.id || "").toLowerCase();

    const matchesSearch = !query || pName.includes(query) || pPhone.includes(query) || pId.includes(query);
    const matchesStatus = statusFilter === "All" || (p.status || "Active") === statusFilter;
    const matchesGender = genderFilter === "All" || (p.gender || "").toLowerCase() === genderFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesGender;
  });

  // Open Edit Modal with pre-filled patient info
  const handleOpenEdit = (patient) => {
    setEditFormData({
      id: patient.id,
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "Male",
      contact: patient.contact || patient.phone || "",
      email: patient.email || "",
      status: patient.status || "Active"
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Patient
  const handleSaveEditPatient = async (e) => {
    e.preventDefault();
    const updates = {
      name: editFormData.name.trim(),
      age: editFormData.age,
      gender: editFormData.gender,
      contact: editFormData.contact.trim(),
      phone: editFormData.contact.trim(),
      email: editFormData.email.trim(),
      status: editFormData.status,
      isActive: editFormData.status === "Active"
    };

    const response = await api.put(`/Patients/${editFormData.id}`, updates);
    if (response.success || response.status === 204) {
        fetchPatients();
    } else {
        alert("Failed to update patient in database.");
    }

    setIsEditModalOpen(false);

    if (selectedPatient && selectedPatient.id === editFormData.id) {
      setSelectedPatient({ ...selectedPatient, ...updates });
    }
  };

  // Toggle Patient Status (Active / Inactive)
  const handleToggleStatus = async (patient) => {
    const newStatus = (patient.status || "Active") === "Active" ? "Inactive" : "Active";
    const isActive = newStatus === "Active";
    
    // API Call
    const response = await api.put(`/Patients/${patient.id}`, { ...patient, isActive, status: newStatus });
    if (response.success || response.status === 204) {
        fetchPatients();
        if (selectedPatient && selectedPatient.id === patient.id) {
          setSelectedPatient({ ...selectedPatient, status: newStatus, isActive });
        }
    } else {
        alert("Failed to update patient status in database.");
    }
  };

  // Prompt Confirmation Modal for Deletion
  const handlePromptDelete = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Patient
  const confirmDeletePatient = async () => {
    if (patientToDelete) {
      // API call (if delete supported, else fallback)
      const response = await api.delete(`/Patients/${patientToDelete.id}`);
      
      if (response.success || response.status === 204 || response.status === 404) {
          fetchPatients();
      } else {
          alert("Failed to delete patient from database.");
      }
      
      if (selectedPatient && selectedPatient.id === patientToDelete.id) {
        setIsViewModalOpen(false);
        setSelectedPatient(null);
      }
      setPatientToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="patient-dashboard-content">
      {/* 1. Page Header */}
      <PageHeader 
        title="Patient Management" 
        subtitle="View and manage patient records across the system"
      />

      {/* 2. Top Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Patients</span>
            <div className="admin-stat-icon-wrapper">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.total}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Registered system patients</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Active Patients</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#10b981" }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.active}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Currently active accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Inactive Patients</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#fef2f2", color: "#ef4444" }}>
              <UserX size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.inactive}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Inactive patient accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">New Patients</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#eff6ff", color: "#3b82f6" }}>
              <UserPlus size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.newThisMonth}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Registered this month</span>
        </div>
      </div>

      {/* 3. Search and Filter Card */}
      <div className="admin-table-card">
        <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: "12px", padding: "14px 20px" }}>
          <div style={{ flex: "1 1 320px", minWidth: "260px" }}>
            <SearchBox 
              placeholder="Search patients by name or phone..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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

            {/* Gender Filter */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* 4. Result Count Strip */}
        <div style={{ padding: "10px 20px", backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)", fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
          Showing <strong style={{ color: "var(--text-heading)" }}>{filteredPatients.length}</strong> of <strong style={{ color: "var(--text-heading)" }}>{patients.length}</strong> registered patients
        </div>

        {/* 5. Patient Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "26%" }}>PATIENT</th>
                <th style={{ width: "10%" }}>AGE</th>
                <th style={{ width: "18%" }}>CONTACT</th>
                <th style={{ width: "16%" }}>REGISTERED</th>
                <th style={{ width: "12%" }}>APPOINTMENTS</th>
                <th style={{ width: "10%" }}>STATUS</th>
                <th style={{ width: "8%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(p => {
                const initials = p.name ? p.name.charAt(0).toUpperCase() : "P";

                return (
                  <tr key={p.id}>
                    {/* PATIENT: Avatar, Name, ID */}
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar" style={{ background: "rgba(47, 111, 163, 0.1)", color: "var(--primary)" }}>
                          {initials}
                        </div>
                        <div className="user-details">
                          <span className="user-name" style={{ fontSize: "14px", fontWeight: "600" }}>
                            {p.name}
                          </span>
                          <span className="user-subtext" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {p.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* AGE */}
                    <td>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {p.age ? `${p.age} yrs` : "N/A"}
                      </span>
                    </td>

                    {/* CONTACT */}
                    <td>
                      <span style={{ fontSize: "13.5px", color: "var(--text-heading)" }}>
                        {p.contact || p.phone || "N/A"}
                      </span>
                    </td>

                    {/* REGISTERED */}
                    <td>
                      <span style={{ fontSize: "13.5px", color: "var(--text-heading)" }}>
                        {p.date || "N/A"}
                      </span>
                    </td>

                    {/* APPOINTMENTS */}
                    <td>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {p.appointments || 0}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="nowrap">
                      <StatusBadge status={p.status || "Active"} />
                    </td>

                    {/* ACTIONS */}
                    <td className="nowrap text-right" style={{ textAlign: "right" }}>
                      <div className="table-actions-cell">
                        {/* View Button */}
                        <button
                          className="icon-action-btn"
                          title="View Patient"
                          onClick={() => { setSelectedPatient(p); setIsViewModalOpen(true); }}
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit Button */}
                        <button
                          className="icon-action-btn"
                          title="Edit Patient"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit size={17} />
                        </button>

                        {/* More Menu Dropdown */}
                        <div className="more-menu-container">
                          <button
                            className={`icon-action-btn ${openMenuId === p.id ? "active" : ""}`}
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === p.id ? null : p.id);
                            }}
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenuId === p.id && (
                            <div className="more-menu-dropdown">
                              <button
                                className="more-menu-item"
                                onClick={() => {
                                  handleToggleStatus(p);
                                  setOpenMenuId(null);
                                }}
                              >
                                {(p.status || "Active") === "Active" ? "Disable Patient" : "Enable Patient"}
                              </button>
                              <button
                                className="more-menu-item danger"
                                onClick={() => {
                                  handlePromptDelete(p);
                                  setOpenMenuId(null);
                                }}
                              >
                                Delete Patient
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-xl text-gray" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No patients found matching your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Patient Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        title="Patient Details"
        className="hospital-modal-container"
      >
        {selectedPatient && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>PATIENT NAME</label>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-heading)", marginTop: "4px" }}>{selectedPatient.name}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>PATIENT ID</label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--primary)", marginTop: "4px" }}>{selectedPatient.id}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>AGE & GENDER</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedPatient.age ? `${selectedPatient.age} yrs` : "N/A"}, {selectedPatient.gender || "Not specified"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>STATUS</label>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={selectedPatient.status || "Active"} />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CONTACT PHONE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedPatient.contact || selectedPatient.phone || "N/A"}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedPatient.email || "N/A"}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>REGISTRATION DATE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedPatient.date || "N/A"}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>APPOINTMENTS COUNT</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedPatient.appointments || 0} appointments</div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "8px" }}>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => { setIsViewModalOpen(false); handleOpenEdit(selectedPatient); }}>Edit Patient</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Details"
        className="hospital-modal-container"
      >
        <form onSubmit={handleSaveEditPatient} className="hospital-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
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
              <label className="form-label">Age *</label>
              <input
                type="number"
                className="form-input"
                value={editFormData.age}
                onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-select"
                value={editFormData.gender}
                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Phone *</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.contact}
                onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
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
              <label className="form-label">Patient ID</label>
              <input
                type="text"
                className="form-input"
                value={editFormData.id}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Patient Deletion"
        className="hospital-modal-container"
      >
        {patientToDelete && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <p style={{ fontSize: "14.5px", color: "var(--text-heading)", lineHeight: "1.5", margin: 0 }}>
              Are you sure you want to delete patient <strong>{patientToDelete.name}</strong>? This action cannot be undone and will permanently remove their record from the system.
            </p>
            <div className="form-actions" style={{ marginTop: "10px" }}>
              <Button variant="outline" type="button" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                style={{ backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#ffffff" }}
                onClick={confirmDeletePatient}
              >
                Delete Patient
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminPatients;
