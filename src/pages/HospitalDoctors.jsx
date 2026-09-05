import { useState, useEffect } from "react";
import { Stethoscope, Plus, Search, Eye, Edit, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "../utils/auth";

import { generateLoginId, generatePassword } from "../utils/idGenerator";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Input from "../components/Input";
import Card from "../components/Card";
import "./AdminShared.css";

function HospitalDoctors() {
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    specialization: "Cardiology",
    qualification: "MD",
    experience: "5 years",
    fee: "800",
    contact: "",
    status: "Active"
  });

  useEffect(() => {
    loadHospitalDoctors();
  }, []);

  const loadHospitalDoctors = () => {
    const user = getCurrentUser();
    if (!user) return;

    const hospitals = getHospitals();
    const hosRecord = hospitals.find((h) => h.id === user.refId || h.name === user.name) || {
      id: user.refId || "HOS-008",
      name: user.name || "MediCare Hospital"
    };

    setHospital(hosRecord);
    const identifier = hosRecord.id || hosRecord.name;
    const hosDocs = getHospitalDoctors(identifier);
    setDoctors(hosDocs);
  };

  const handleSearchChange = (val) => {
    if (typeof val === "string") setSearchTerm(val);
    else if (val && val.target) setSearchTerm(val.target.value || "");
    else setSearchTerm("");
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      specialization: "Cardiology",
      qualification: "MD, MBBS",
      experience: "5 years",
      fee: "800",
      contact: "",
      status: "Active"
    });
    setError("");
    setCreatedCredentials(null);
    setIsAddModalOpen(true);
  };

  const handleCreateDoctor = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Doctor name is required.");
      return;
    }
    if (!formData.specialization.trim()) {
      setError("Specialization is required.");
      return;
    }

    const currentUsers = getUsers();
    const loginId = generateLoginId(formData.name, "1985", currentUsers);
    const password = generatePassword(formData.name, "1985");
    const doctorId = `DOC-${Date.now().toString().slice(-4)}`;

    const newDoctor = {
      id: doctorId,
      name: formData.name.startsWith("Dr.") ? formData.name.trim() : `Dr. ${formData.name.trim()}`,
      specialization: formData.specialization.trim(),
      specialty: formData.specialization.trim(),
      qualification: formData.qualification.trim() || "MD",
      experience: formData.experience.trim() || "5 years",
      fee: parseInt(formData.fee, 10) || 800,
      consultationFee: parseInt(formData.fee, 10) || 800,
      hospital: hospital.name,
      hospitalId: hospital.id,
      contact: formData.contact.trim() || `${loginId}@medibook.com`,
      status: formData.status || "Active",
      loginId,
      password,
      availableDays: ["Mon", "Wed", "Fri"],
      rating: 4.8,
      reviewCount: 12
    };

    // Add to storage
    addDoctor(newDoctor);

    // Create user login credential
    addUser({
      id: `U_DOC_${doctorId}`,
      loginId,
      mobile: loginId,
      password,
      role: "doctor",
      name: newDoctor.name,
      refId: doctorId,
      status: "Active"
    });

    setCreatedCredentials({
      doctorName: newDoctor.name,
      hospitalName: hospital.name,
      loginId,
      password
    });

    loadHospitalDoctors();
  };

  const filteredDoctors = doctors.filter((doc) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const nameStr = String(doc.name || "").toLowerCase();
    const specStr = String(doc.specialization || doc.specialty || "").toLowerCase();
    const idStr = String(doc.id ?? "").toLowerCase();
    return nameStr.includes(query) || specStr.includes(query) || idStr.includes(query);
  });

  const getInitials = (name = "") => {
    return name
      .replace(/^dr\.\s+/i, "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <main className="patient-dashboard-content">
      <PageHeader
        title="Doctors Directory"
        subtitle={`Manage medical specialists affiliated with ${hospital?.name || "your hospital"}`}
      >
        <Button variant="primary" onClick={handleOpenAddModal} style={{ gap: "6px" }}>
          <Plus size={16} /> Add New Doctor
        </Button>
      </PageHeader>

      <div className="admin-table-card">
        {/* Toolbar */}
        <div className="admin-toolbar" style={{ padding: "12px 20px" }}>
          <SearchBox
            placeholder="Search doctors by name, specialization, or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Doctors Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>DOCTOR NAME</th>
                <th style={{ width: "22%" }}>SPECIALIZATION</th>
                <th style={{ width: "16%" }}>EXPERIENCE</th>
                <th style={{ width: "14%" }}>FEE (₹)</th>
                <th style={{ width: "10%" }}>STATUS</th>
                <th style={{ width: "8%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="user-info-cell">
                      <div
                        className="user-avatar"
                        style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
                      >
                        {getInitials(doc.name)}
                      </div>
                      <div className="user-details">
                        <span className="user-name" style={{ fontSize: "14px" }}>
                          {doc.name}
                        </span>
                        <span className="user-subtext" style={{ fontSize: "12px" }}>
                          {doc.id} • {doc.loginId || "login: " + doc.name.toLowerCase().replace(/\s+/g, "")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-details">
                      <span className="user-name" style={{ fontSize: "13.5px", fontWeight: "600" }}>
                        {doc.specialization || doc.specialty || "General Medicine"}
                      </span>
                      <span className="user-subtext" style={{ fontSize: "12px" }}>
                        {doc.qualification || "MD"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                      {doc.experience || "5 years"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--primary)" }}>
                      ₹{doc.fee || doc.consultationFee || 800}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={doc.status || "Active"} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-action-btn"
                      title="View Details"
                      onClick={() => {
                        setSelectedDoctor(doc);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No doctors found matching your search.
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
        {createdCredentials ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#ecfdf5",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                padding: "16px",
                borderRadius: "var(--radius-md)"
              }}
            >
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>Doctor Account Created!</div>
                <div style={{ fontSize: "13px", marginTop: "2px" }}>
                  {createdCredentials.doctorName} has been assigned to <strong>{createdCredentials.hospitalName}</strong>.
                </div>
              </div>
            </div>

            <Card style={{ background: "#f8fafc", border: "1px solid var(--border)", padding: "16px" }}>
              <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <KeyRound size={16} color="var(--primary)" /> Doctor Login Credentials
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Login ID: </span>
                  <strong style={{ color: "var(--primary)", fontFamily: "monospace", fontSize: "15px" }}>
                    {createdCredentials.loginId}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Password: </span>
                  <strong style={{ color: "var(--text-heading)", fontFamily: "monospace", fontSize: "15px" }}>
                    {createdCredentials.password}
                  </strong>
                </div>
              </div>
            </Card>

            <div className="form-actions" style={{ marginTop: "12px" }}>
              <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateDoctor} className="hospital-form">
            {error && <div className="form-error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label">Doctor Full Name *</label>
              <Input
                placeholder="e.g. Dr. John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <select
                  className="form-select"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gynecology">Gynecology</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Qualification</label>
                <Input
                  placeholder="e.g. MBBS, MD, DM"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience</label>
                <Input
                  placeholder="e.g. 10 years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <Input
                  type="number"
                  placeholder="800"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                />
              </div>
            </div>

            {/* Read-only Hospital association lock */}
            <div className="form-group">
              <label className="form-label">Hospital Association (Locked)</label>
              <Input value={hospital?.name || "MediCare Hospital"} disabled={true} />
            </div>

            <div className="form-actions">
              <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Doctor Account
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Doctor View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Doctor Profile Details"
        className="hospital-modal-container"
      >
        {selectedDoctor && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>FULL NAME</label>
                <div style={{ fontWeight: "700", color: "var(--text-heading)", fontSize: "15px" }}>{selectedDoctor.name}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>DOCTOR ID</label>
                <div style={{ fontWeight: "600", color: "var(--primary)" }}>{selectedDoctor.id}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>SPECIALIZATION</label>
                <div>{selectedDoctor.specialization || selectedDoctor.specialty}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>EXPERIENCE</label>
                <div>{selectedDoctor.experience}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>CONSULTATION FEE</label>
                <div style={{ fontWeight: "700", color: "var(--primary)" }}>₹{selectedDoctor.fee || selectedDoctor.consultationFee}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>LOGIN ID</label>
                <div style={{ fontFamily: "monospace", fontWeight: "600" }}>{selectedDoctor.loginId || "N/A"}</div>
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: "12px" }}>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default HospitalDoctors;
