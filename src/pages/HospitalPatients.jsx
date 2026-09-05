import { useState, useEffect } from "react";
import { Users, Search, Eye, Phone, Calendar } from "lucide-react";
import { getCurrentUser } from "../utils/auth";

import PageHeader from "../components/PageHeader";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Button from "../components/Button";
import "./AdminShared.css";

function HospitalPatients() {
  const [hospital, setHospital] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadHospitalPatients();
  }, []);

  const loadHospitalPatients = () => {
    const user = getCurrentUser();
    if (!user) return;

    const hospitals = getHospitals();
    const hosRecord = hospitals.find((h) => h.id === user.refId || h.name === user.name) || {
      id: user.refId || "HOS-008",
      name: user.name || "MediCare Hospital"
    };

    setHospital(hosRecord);
    const identifier = hosRecord.id || hosRecord.name;
    const hosPatients = getHospitalPatients(identifier);
    const hosAppts = getHospitalAppointments(identifier);

    setPatients(hosPatients);
    setAppointments(hosAppts);
  };

  const handleSearchChange = (val) => {
    if (typeof val === "string") setSearchTerm(val);
    else if (val && val.target) setSearchTerm(val.target.value || "");
    else setSearchTerm("");
  };

  const filteredPatients = patients.filter((pat) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const nameStr = String(pat.name || "").toLowerCase();
    const idStr = String(pat.id ?? "").toLowerCase();
    const contactStr = String(pat.contact || "").toLowerCase();
    return nameStr.includes(query) || idStr.includes(query) || contactStr.includes(query);
  });

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getPatientAppointments = (patientId, patientName) => {
    return appointments.filter((a) => {
      const pIdMatch = patientId && a.patientId && String(a.patientId).toLowerCase() === String(patientId).toLowerCase();
      const pNameMatch = patientName && a.patientName && String(a.patientName).toLowerCase() === String(patientName).toLowerCase();
      return pIdMatch || pNameMatch;
    });
  };

  return (
    <main className="patient-dashboard-content">
      <PageHeader
        title="Associated Patients"
        subtitle={`Patients who have booked consultations at ${hospital?.name || "your hospital"}`}
      />

      <div className="admin-table-card">
        {/* Toolbar */}
        <div className="admin-toolbar" style={{ padding: "12px 20px" }}>
          <SearchBox
            placeholder="Search patients by name, ID, or contact number..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Patients Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>PATIENT NAME</th>
                <th style={{ width: "18%" }}>AGE & GENDER</th>
                <th style={{ width: "22%" }}>CONTACT NUMBER</th>
                <th style={{ width: "16%" }}>HOSPITAL VISITS</th>
                <th style={{ width: "14%" }}>STATUS</th>
                <th style={{ width: "8%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((pat) => {
                const patientAppts = getPatientAppointments(pat.id, pat.name);
                return (
                  <tr key={pat.id}>
                    <td>
                      <div className="user-info-cell">
                        <div
                          className="user-avatar"
                          style={{ background: "rgba(47, 111, 163, 0.1)", color: "var(--primary)" }}
                        >
                          {getInitials(pat.name)}
                        </div>
                        <div className="user-details">
                          <span className="user-name" style={{ fontSize: "14px" }}>
                            {pat.name}
                          </span>
                          <span className="user-subtext" style={{ fontSize: "12px" }}>
                            ID: {pat.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13.5px", color: "var(--text-heading)", fontWeight: "500" }}>
                        {pat.age ? `${pat.age} yrs` : "N/A"} • {pat.gender || "Patient"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px" }}>
                        <Phone size={14} style={{ color: "var(--primary)" }} />
                        <span>{pat.contact || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "14px" }}>
                        {patientAppts.length} appointment(s)
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={pat.status || "Active"} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="icon-action-btn"
                        title="View Details"
                        onClick={() => {
                          setSelectedPatient(pat);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No patient records found for your hospital.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Patient Details"
        className="hospital-modal-container"
      >
        {selectedPatient && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>PATIENT NAME</label>
                <div style={{ fontWeight: "700", color: "var(--text-heading)", fontSize: "15px" }}>{selectedPatient.name}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>PATIENT ID</label>
                <div style={{ fontWeight: "600", color: "var(--primary)" }}>{selectedPatient.id}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>AGE & GENDER</label>
                <div>{selectedPatient.age ? `${selectedPatient.age} yrs` : "N/A"} • {selectedPatient.gender}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>CONTACT NUMBER</label>
                <div>{selectedPatient.contact}</div>
              </div>
            </div>

            <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
              <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", display: "block" }}>
                APPOINTMENTS AT {hospital?.name}
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {getPatientAppointments(selectedPatient.id, selectedPatient.name).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "#f8fafc",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "13.5px" }}>{a.doctorName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {a.date} at {a.time}
                      </div>
                    </div>
                    <StatusBadge status={a.status || "Confirmed"} />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "8px" }}>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default HospitalPatients;
