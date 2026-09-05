import { useState, useEffect, useCallback } from "react";
import { CalendarDays, Search, Eye, Filter, Loader2, AlertCircle } from "lucide-react";
import { getCurrentUser } from "../utils/auth";

import PageHeader from "../components/PageHeader";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import "./AdminShared.css";

function HospitalAppointments() {
  const [hospital, setHospital] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Helper to format backend time strings (e.g. "10:30:00" -> "10:30 AM")
  const formatBackendTime = (timeStr) => {
    if (!timeStr) return "10:30 AM";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hh = String(hours).padStart(2, "0");
      return `${hh}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  // Map backend response fields to frontend contract
  const normalizeBackendAppointment = (apt) => {
    const rawDate = apt.appointmentDate ? String(apt.appointmentDate).split("T")[0] : "";
    const displayTime = formatBackendTime(apt.appointmentTime);
    const apptReason = apt.reason || apt.appointmentType || "Consultation";

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName || "Patient",
      doctorId: apt.doctorId,
      doctorName: apt.doctorName || "Doctor",
      hospitalId: apt.hospitalId,
      hospitalName: apt.hospitalName || "MediCare Hospital",
      hospital: apt.hospitalName || "MediCare Hospital",
      appointmentDate: apt.appointmentDate,
      date: rawDate,
      time: displayTime,
      appointmentTime: apt.appointmentTime,
      status: apt.status || "Pending",
      appointmentType: apt.appointmentType || "Consultation",
      specialty: apt.appointmentType || "Consultation",
      type: apptReason,
      reason: apptReason,
      consultationFee: apt.consultationFee ?? 500,
      fee: apt.consultationFee ?? 500,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    };
  };

  // Load appointments from backend API GET /api/Appointments
  const loadHospitalAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const user = getCurrentUser();
    const hosRecord = {
      id: user?.refId || user?.id || 1,
      name: user?.name || "MediCare Hospital"
    };

    setHospital(hosRecord);

    try {
      const response = await fetch("http://localhost:5107/api/Appointments");
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const allApiAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];

      const hosIdInt = hosRecord.id || user?.refId || user?.id || "";
      const hosNameStr = String(hosRecord.name || user?.name || "").trim().toLowerCase();

      // Filter appointments for current hospital
      const myAppts = allApiAppts.filter((apt) => {
        const aptHosIdInt = apt.hospitalId || "";
        const aptHosNameStr = String(apt.hospitalName || "").trim().toLowerCase();

        // 1. Direct hospital ID match
        if (hosIdInt && aptHosIdInt && hosIdInt === aptHosIdInt) return true;

        // 2. Hospital name match
        if (hosNameStr && aptHosNameStr && (hosNameStr === aptHosNameStr || hosNameStr.includes(aptHosNameStr) || aptHosNameStr.includes(hosNameStr))) return true;

        // 3. Fallback for default hospital ID 1 / MediCare Hospital
        if ((!hosIdInt || hosIdInt === 1) && (!aptHosIdInt || aptHosIdInt === 1)) return true;

        return false;
      });

      setAppointments(myAppts);
    } catch (err) {
      console.error("Error loading hospital appointments from backend:", err);
      setError("Unable to connect to backend server. Please check if ASP.NET Core API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHospitalAppointments();
  }, [loadHospitalAppointments]);

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

        {/* Table & Loading/Error States */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
              Loading hospital appointments...
            </p>
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load appointments"
            description={error}
            icon={AlertCircle}
            actionLabel="Try Again"
            onAction={loadHospitalAppointments}
          />
        ) : (
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
        )}
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
