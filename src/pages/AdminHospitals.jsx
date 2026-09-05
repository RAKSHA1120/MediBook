import { useState, useEffect } from "react";
import { Building2, Eye, Edit, MoreVertical, MapPin } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import "./AdminShared.css";

import { api } from "../utils/api";

function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "",
    location: "",
    status: "Active",
    contact: "",
    email: "",
    address: ""
  });

  const fetchHospitals = async () => {
    try {
      const response = await api.get("/Hospitals");
      if (response.success) {
        setHospitals(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals", error);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Listener to close options popover on document click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".more-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSearchChange = (val) => {
    if (typeof val === "string") {
      setSearchTerm(val);
    } else if (val && val.target) {
      setSearchTerm(val.target.value || "");
    } else {
      setSearchTerm("");
    }
  };

  const openAddModal = () => {
    setEditingHospital(null);
    setFormData({
      name: "",
      type: "Private",
      category: "Multi Specialty",
      location: "",
      status: "Active",
      contact: "",
      email: "",
      address: ""
    });
    setErrorMessage("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name || "",
      type: hospital.type || "Private",
      category: hospital.category || "Multi Specialty",
      location: hospital.location || "",
      status: hospital.status || "Active",
      contact: hospital.contact || "",
      email: hospital.email || "",
      address: hospital.address || ""
    });
    setErrorMessage("");
    setIsFormModalOpen(true);
  };

  const handleSubmitHospital = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Hospital Name is required.");
      return;
    }
    if (!formData.contact.trim()) {
      setErrorMessage("Contact Number is required.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Email Address is required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim() || formData.location.trim() || "Address not provided",
      phone: formData.contact.trim(),
      email: formData.email.trim(),
      isActive: formData.status === "Active"
    };

    if (editingHospital) {
      payload.id = editingHospital.id;
      const response = await api.put(`/Hospitals/${editingHospital.id}`, payload);
      if (response.success || response.status === 204) {
        fetchHospitals();
      } else {
        alert("Failed to update hospital.");
      }
    } else {
      const response = await api.post("/Hospitals", payload);
      if (response.success) {
        fetchHospitals();
      } else {
        alert("Failed to create hospital.");
      }
    }

    setIsFormModalOpen(false);
  };

  const handleToggleStatus = async (hospital) => {
    const newStatus = hospital.isActive ? "Inactive" : "Active";
    const payload = {
      ...hospital,
      isActive: !hospital.isActive
    };
    const response = await api.put(`/Hospitals/${hospital.id}`, payload);
    if (response.success || response.status === 204) {
      fetchHospitals();
    } else {
      alert("Failed to update status.");
    }
  };

  const handleDeleteHospital = async (id) => {
    if (window.confirm("Are you sure you want to remove this hospital from the network?")) {
      const response = await api.delete(`/Hospitals/${id}`);
      if (response.success || response.status === 204 || response.status === 404) {
        fetchHospitals();
        setIsViewModalOpen(false);
      } else {
        alert("Failed to delete hospital.");
      }
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const query = (searchTerm || "").toLowerCase().trim();
    if (!query) return true;
    return (
      (h.name && h.name.toLowerCase().includes(query)) ||
      (h.email && h.email.toLowerCase().includes(query)) ||
      (h.id && String(h.id).toLowerCase().includes(query))
    );
  });

  return (
    <div className="patient-dashboard-content">
      <PageHeader
        title="Hospital Master"
        subtitle="Manage registered hospitals, network clinics, and facility details"
      >
        <Button variant="primary" onClick={openAddModal}>
          Add New Hospital
        </Button>
      </PageHeader>

      <div className="admin-table-card">
        {/* Compact Search Toolbar */}
        <div className="admin-toolbar" style={{ padding: "12px 20px" }}>
          <SearchBox
            placeholder="Search hospitals by name, type, location, or category..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>HOSPITAL NAME</th>
                <th style={{ width: "24%" }}>TYPE & CATEGORY</th>
                <th style={{ width: "20%" }}>LOCATION</th>
                <th style={{ width: "12%" }}>STATUS</th>
                <th style={{ width: "12%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.map(h => (
                <tr key={h.id}>
                  {/* Column 1: Hospital Name & ID */}
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar" style={{ background: "rgba(47, 111, 163, 0.1)", color: "var(--primary)" }}>
                        <Building2 size={18} />
                      </div>
                      <div className="user-details">
                        <span className="user-name" style={{ fontSize: "14px", lineHeight: "1.35", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {h.name}
                        </span>
                        <span className="user-subtext" style={{ fontSize: "12px", marginTop: "2px" }}>{h.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Type & Category */}
                  <td>
                    <div className="user-details">
                      <span className="user-name" style={{ fontSize: "13.5px", fontWeight: "600" }}>{h.type || "Private"}</span>
                      <span className="user-subtext" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{h.category || "Multi Specialty"}</span>
                    </div>
                  </td>

                  {/* Column 3: Location */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-heading)", fontWeight: "500", fontSize: "13.5px" }}>
                      <MapPin size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <span>{h.location}</span>
                    </div>
                  </td>

                  {/* Column 4: Status */}
                  <td className="nowrap">
                    <StatusBadge status={h.status} />
                  </td>

                  {/* Column 5: Compact Actions (View, Edit, More) */}
                  <td className="nowrap text-right" style={{ textAlign: "right" }}>
                    <div className="table-actions-cell">
                      {/* View Button */}
                      <button
                        className="icon-action-btn"
                        title="View Hospital"
                        onClick={() => { setSelectedHospital(h); setIsViewModalOpen(true); }}
                      >
                        <Eye size={17} />
                      </button>

                      {/* Edit Button */}
                      <button
                        className="icon-action-btn"
                        title="Edit Hospital"
                        onClick={() => openEditModal(h)}
                      >
                        <Edit size={17} />
                      </button>

                      {/* More Menu Dropdown */}
                      <div className="more-menu-container">
                        <button
                          className={`icon-action-btn ${openMenuId === h.id ? "active" : ""}`}
                          title="More options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === h.id ? null : h.id);
                          }}
                        >
                          <MoreVertical size={17} />
                        </button>

                        {openMenuId === h.id && (
                          <div className="more-menu-dropdown">
                            <button
                              className="more-menu-item"
                              onClick={() => {
                                handleToggleStatus(h);
                                setOpenMenuId(null);
                              }}
                            >
                              {h.status === "Active" ? "Disable Hospital" : "Enable Hospital"}
                            </button>
                            <button
                              className="more-menu-item danger"
                              onClick={() => {
                                handleDeleteHospital(h.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Delete Hospital
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHospitals.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-xl text-gray" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No hospitals found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Hospital Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingHospital ? "Edit Hospital" : "Add New Hospital"}
        className="hospital-modal-container"
      >
        <form onSubmit={handleSubmitHospital} className="hospital-form">
          {errorMessage && (
            <div className="form-error-banner">
              {errorMessage}
            </div>
          )}

          {/* Hospital Name * */}
          <div className="form-group">
            <label className="form-label">Hospital Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. City General Hospital"
            />
          </div>

          {/* Hospital Type * & Category * */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hospital Type *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Specialty Hospital">Specialty Hospital</option>
                <option value="Clinic">Clinic</option>
                <option value="Teaching Hospital">Teaching Hospital</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Super Specialty">Super Specialty</option>
                <option value="Multi Specialty">Multi Specialty</option>
                <option value="General Care">General Care</option>
                <option value="Specialty Center">Specialty Center</option>
                <option value="Primary Care">Primary Care</option>
              </select>
            </div>
          </div>

          {/* Location * & Status */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangalore"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Contact Number * & Email Address * */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input
                type="text"
                className="form-input"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="e.g. +91 80 2345 6789"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. info@hospital.com"
              />
            </div>
          </div>

          {/* Full Address (Optional) */}
          <div className="form-group">
            <label className="form-label">Full Address (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 123 Healthcare Blvd, Sector 4"
            />
          </div>

          {/* Modal Form Actions */}
          <div className="form-actions">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingHospital ? "Save Changes" : "Add Hospital"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Hospital Details" className="hospital-modal-container">
        {selectedHospital && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>HOSPITAL NAME</label>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.name}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>FACILITY ID</label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--primary)", marginTop: "4px" }}>{selectedHospital.id}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>HOSPITAL TYPE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.type || "Private"}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CATEGORY</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.category || "Multi Specialty"}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>LOCATION</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.location}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>STATUS</label>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={selectedHospital.status} />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CONTACT NUMBER</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.contact}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.email}</div>
              </div>
            </div>
            {selectedHospital.address && (
              <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>FULL ADDRESS</label>
                <div style={{ fontSize: "14px", color: "var(--text-heading)", marginTop: "4px" }}>{selectedHospital.address}</div>
              </div>
            )}
            <div className="form-actions" style={{ marginTop: "8px" }}>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminHospitals;
