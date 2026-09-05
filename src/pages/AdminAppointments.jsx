import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";
import { api } from "../utils/api";
import "./AdminDashboard.css";
import "./AdminShared.css";

// Type-safe string normalization helpers
const safeStr = (val) => (val === null || val === undefined ? "" : String(val)).trim();
const toLowerStr = (val) => safeStr(val).toLowerCase();

function AdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("");

  const [debugLog, setDebugLog] = useState("");

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:5107/api/Appointments", {
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        setDebugLog("Error status: " + response.status);
        return;
      }
      const data = await response.json();
      setDebugLog("Success: fetched " + (data ? data.length : 0) + " items");
      const mapped = (data || []).map(a => ({
        ...a,
        date: a.appointmentDate ? String(a.appointmentDate).split('T')[0] : a.date,
        time: a.appointmentTime || a.time,
        type: a.appointmentType || a.type
      }));
      setAppointments(mapped);
    } catch (error) {
      setDebugLog("Exception: " + error.message);
      console.error("Failed to fetch appointments", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const tabs = [
    { id: "All", label: "All" },
    { id: "Upcoming", label: "Upcoming" },
    { id: "Pending", label: "Pending" },
    { id: "Completed", label: "Completed" },
    { id: "Cancelled", label: "Cancelled" }
  ];

  const handleSearchChange = (val) => {
    if (typeof val === "string") {
      setSearchTerm(val);
    } else if (val && val.target) {
      setSearchTerm(val.target.value || "");
    } else {
      setSearchTerm("");
    }
  };

  // Dynamic KPI Stats Calculation
  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter(a => {
      const s = toLowerStr(a.status);
      return s === "upcoming" || s === "confirmed" || s === "scheduled";
    }).length;
    const pending = appointments.filter(a => toLowerStr(a.status) === "pending").length;
    const completed = appointments.filter(a => toLowerStr(a.status) === "completed").length;
    const cancelled = appointments.filter(a => toLowerStr(a.status) === "cancelled").length;

    return { total, upcoming, pending, completed, cancelled };
  }, [appointments]);

  // Handle View Modal
  const handleOpenViewModal = (apt) => {
    setSelectedAppointment(apt);
    setModalStatus(apt.status || "Upcoming");
    setIsViewModalOpen(true);
  };

  // Save Status Change from Modal
  const handleSaveStatusChange = async () => {
    if (selectedAppointment && modalStatus) {
      try {
        const payload = { status: modalStatus };
        const response = await api.put(`/Appointments/${selectedAppointment.id}/status`, payload);
        if (response.success || response.status === 204) {
          fetchAppointments();
          setSelectedAppointment({ ...selectedAppointment, status: modalStatus });
          setIsViewModalOpen(false);
        } else {
          alert("Failed to update status");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filtered Appointments Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // 1. Search filter (Patient, Doctor, Appointment ID)
      const query = toLowerStr(searchTerm);
      const pName = toLowerStr(apt.patientName || apt.patient);
      const dName = toLowerStr(apt.doctorName || apt.doctor);
      const aptId = toLowerStr(apt.id);

      const matchesSearch = !query || pName.includes(query) || dName.includes(query) || aptId.includes(query);

      // 2. Tab Status filter
      let matchesTab = true;
      if (activeTab !== "All") {
        const s = toLowerStr(apt.status);
        const normStatus = (s === 'scheduled' || s === 'confirmed') ? 'upcoming' : s;
        matchesTab = normStatus === toLowerStr(activeTab);
      }

      // 3. Date filter
      let matchesDate = true;
      const todayStr = new Date().toISOString().split('T')[0];
      const aptDate = safeStr(apt.date);

      if (dateFilter === "Today") {
        matchesDate = aptDate === todayStr;
      } else if (dateFilter === "Upcoming") {
        matchesDate = aptDate >= todayStr;
      } else if (dateFilter === "Custom" && customDate) {
        matchesDate = aptDate === customDate;
      }

      return matchesSearch && matchesTab && matchesDate;
    });
  }, [appointments, searchTerm, activeTab, dateFilter, customDate]);

  // Clean Date & Time Formatter (e.g. "04 Sep 2026", "12:30 PM")
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return { date: "N/A", time: timeStr || "" };
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        if (!isNaN(d.getTime())) {
          const formattedDate = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
          return { date: formattedDate, time: timeStr || "10:00 AM" };
        }
      }
    } catch (e) {}
    return { date: dateStr, time: timeStr || "10:00 AM" };
  };

  return (
    <div className="patient-dashboard-content">
      {/* 1. Page Header */}
      <PageHeader 
        title="Appointment Management" 
        subtitle="Monitor and manage all system appointments"
      />

      {/* 2. Top 5 Statistics Cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Appointments</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.total}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">All system appointments</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Upcoming Appointments</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#10b981" }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.upcoming}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Scheduled upcoming visits</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Pending Appointments</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#fffbe6", color: "#d97706" }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.pending}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Awaiting confirmation</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Completed Appointments</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.completed}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Completed consultations</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Cancelled Appointments</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#fef2f2", color: "#ef4444" }}>
              <XCircle size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.cancelled}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Cancelled appointments</span>
        </div>
      </div>

      {/* 3. Status Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 4. Search & Filters Section */}
      <div className="admin-table-card" style={{ marginTop: "0", borderTopLeftRadius: "0", borderTopRightRadius: "0" }}>
        <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: "12px", padding: "14px 20px" }}>
          <div style={{ flex: "1 1 320px", minWidth: "260px" }}>
            <SearchBox 
              placeholder="Search by patient or doctor name..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Date Filter Dropdown */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Upcoming">Upcoming Dates</option>
              <option value="Custom">Custom Date</option>
            </select>

            {/* Custom Date Input */}
            {dateFilter === "Custom" && (
              <input
                type="date"
                className="form-input"
                style={{ height: "40px", padding: "0 12px", width: "160px", borderRadius: "8px" }}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* 5. Result Count Strip */}
        <div style={{ padding: "10px 20px", backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)", fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
          Showing <strong style={{ color: "var(--text-heading)" }}>{filteredAppointments.length}</strong> of <strong style={{ color: "var(--text-heading)" }}>{appointments.length}</strong> appointments
        </div>

        {/* 6. Clean Appointment Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "15%" }}>APPOINTMENT ID</th>
                <th style={{ width: "15%" }}>PATIENT</th>
                <th style={{ width: "17%" }}>DOCTOR</th>
                <th style={{ width: "16%" }}>DATE & TIME</th>
                <th style={{ width: "15%" }}>TYPE</th>
                <th style={{ width: "12%" }}>STATUS</th>
                <th style={{ width: "10%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(apt => {
                const rawPatientName = safeStr(apt.patientName || apt.patient);
                const patientName = rawPatientName !== "" ? rawPatientName : "N/A";
                const rawDocName = safeStr(apt.doctorName || apt.doctor);
                const cleanDocName = rawDocName !== ""
                  ? (toLowerStr(rawDocName).startsWith("dr.") ? rawDocName : `Dr. ${rawDocName}`)
                  : "N/A";
                const { date, time } = formatDateTime(apt.date, apt.time);

                return (
                  <tr key={apt.id}>
                    {/* APPOINTMENT ID (Smaller & Muted) */}
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "500", wordBreak: "break-word" }}>
                        {apt.id}
                      </span>
                    </td>

                    {/* PATIENT */}
                    <td>
                      <button
                        type="button"
                        className="patient-name-link"
                        onClick={() => navigate(`/admin/appointments/${apt.id}`)}
                        title={`View appointment details for ${patientName}`}
                      >
                        {patientName}
                      </button>
                    </td>

                    {/* DOCTOR (Name Only) */}
                    <td>
                      <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {cleanDocName}
                      </span>
                    </td>

                    {/* DATE & TIME (Clean Separate Lines) */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                          {date}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {time}
                        </span>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td>
                      <span style={{ fontSize: "13.5px", color: "var(--text-heading)", fontWeight: "400" }}>
                        {apt.type || apt.specialty || "Consultation"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="nowrap">
                      <StatusBadge status={apt.status || "Upcoming"} />
                    </td>

                    {/* ACTIONS */}
                    <td className="nowrap text-right" style={{ textAlign: "right" }}>
                      <div className="table-actions-cell" style={{ justifyContent: "flex-end" }}>
                        <button
                          className="icon-action-btn"
                          title="View Appointment Details"
                          onClick={() => navigate(`/admin/appointments/${apt.id}`)}
                        >
                          <Eye size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-xl text-gray" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No appointments found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Update Appointment Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Appointment Details"
        className="hospital-modal-container"
      >
        {selectedAppointment && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>APPOINTMENT ID</label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--primary)", marginTop: "4px" }}>
                  {selectedAppointment.id}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>CURRENT STATUS</label>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={selectedAppointment.status || "Upcoming"} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>PATIENT NAME</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedAppointment.patientName || selectedAppointment.patient || "Patient"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>DOCTOR NAME</label>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedAppointment.doctorName || "Dr. Emily Carter"}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>SCHEDULED DATE & TIME</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {formatDateTime(selectedAppointment.date, selectedAppointment.time).date} at {selectedAppointment.time || "10:00 AM"}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>APPOINTMENT TYPE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedAppointment.type || selectedAppointment.specialty || "Consultation"}
                </div>
              </div>
            </div>

            {/* Update Status Form Control */}
            <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="form-label" style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-heading)" }}>
                Update Status
              </label>
              <select
                className="form-select"
                style={{ height: "40px", borderRadius: "8px", fontSize: "14px" }}
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
              >
                <option value="Upcoming">Upcoming / Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-actions" style={{ marginTop: "8px" }}>
              <Button variant="outline" type="button" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" type="button" onClick={handleSaveStatusChange}>
                Save Status Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminAppointments;
