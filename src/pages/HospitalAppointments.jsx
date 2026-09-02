import { useState, useEffect } from "react";
import { CalendarDays, Search, Eye, Filter } from "lucide-react";
import {
  getCurrentUser,
  getHospitals,
  getHospitalAppointments
} from "../utils/storage";
import PageHeader from "../components/PageHeader";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Button from "../components/Button";
import "./AdminShared.css";

function HospitalAppointments() {
  const [hospital, setHospital] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    loadHospitalAppointments();
  }, []);

  const loadHospitalAppointments = () => {
    const user = getCurrentUser();
    if (!user) return;

    const hospitals = getHospitals();
    const hosRecord = hospitals.find((h) => h.id === user.refId || h.name === user.name) || {
      id: user.refId || "HOS-008",
      name: user.name || "MediCare Hospital"
    };

    setHospital(hosRecord);
    const identifier = hosRecord.id || hosRecord.name;
    const hosAppts = getHospitalAppointments(identifier);
    setAppointments(hosAppts);
  };

  const handleSearchChange = (val) => {
    if (typeof val === "string") setSearchTerm(val);
    else if (val && val.target) setSearchTerm(val.target.value || "");
    else setSearchTerm("");
  };

  const filteredAppointments = appointments.filter((apt) => {
    const query = searchTerm.toLowerCase().trim();
    const pName = String(apt.patientName || "").toLowerCase();
    const dName = String(apt.doctorName || "").toLowerCase();
    const aId = String(apt.id ?? "").toLowerCase();
    const matchesSearch = !query || pName.includes(query) || dName.includes(query) || aId.includes(query);

    const statusLower = String(apt.status || "").toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "confirmed" && (statusLower === "confirmed" || statusLower === "upcoming")) ||
      statusLower === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <main className="patient-dashboard-content">
      <PageHeader
        title="Hospital Appointments"
        subtitle={`Schedule and appointment records for ${hospital?.name || "your hospital"}`}
      />

      <div className="admin-table-card">
        {/* Toolbar & Filter Bar */}
        <div
          className="admin-toolbar"
          style={{ padding: "12px 20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}
        >
          <div style={{ flex: 1, minWidth: "260px" }}>
            <SearchBox
              placeholder="Search appointments by patient, doctor, or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={16} style={{ color: "var(--text-muted)" }} />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "160px", height: "40px" }}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>PATIENT</th>
                <th style={{ width: "25%" }}>DOCTOR</th>
                <th style={{ width: "20%" }}>DATE & TIME</th>
                <th style={{ width: "18%" }}>TYPE / REASON</th>
                <th style={{ width: "12%" }}>STATUS</th>
                <th style={{ width: "8%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">{getInitials(apt.patientName || "P")}</div>
                      <div className="user-details">
                        <span className="user-name">{apt.patientName || "Patient"}</span>
                        <span className="user-subtext">{apt.patientId || apt.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: "600", color: "var(--text-heading)" }}>
                      {apt.doctorName || "Doctor"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600", color: "var(--text-heading)" }}>{apt.date}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{apt.time}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {apt.specialty || apt.type || "Consultation"}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={apt.status || "Confirmed"} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-action-btn"
                      title="View Details"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No appointments found for your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Appointment Record"
        className="hospital-modal-container"
      >
        {selectedAppointment && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>APPOINTMENT ID</label>
                <div style={{ fontWeight: "700", color: "var(--primary)" }}>{selectedAppointment.id}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>STATUS</label>
                <div>
                  <StatusBadge status={selectedAppointment.status || "Confirmed"} />
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>PATIENT NAME</label>
                <div style={{ fontWeight: "600", color: "var(--text-heading)" }}>{selectedAppointment.patientName}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>DOCTOR</label>
                <div style={{ fontWeight: "600", color: "var(--text-heading)" }}>{selectedAppointment.doctorName}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>SCHEDULED DATE</label>
                <div>{selectedAppointment.date}</div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>TIME SLOT</label>
                <div style={{ fontWeight: "600", color: "var(--primary)" }}>{selectedAppointment.time}</div>
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

export default HospitalAppointments;
