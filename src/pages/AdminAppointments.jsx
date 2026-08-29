import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import SearchBox from "../components/SearchBox";
import StatusBadge from "../components/StatusBadge";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";
import { getAppointments, updateAppointmentStatus } from "../utils/storage";
import "./AdminDashboard.css";
import "./AdminShared.css";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customDate, setCustomDate] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("");

  useEffect(() => {
    setAppointments(getAppointments());
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
      const s = (a.status || "").toLowerCase();
      return s === "upcoming" || s === "confirmed" || s === "scheduled";
    }).length;
    const pending = appointments.filter(a => (a.status || "").toLowerCase() === "pending").length;
    const completed = appointments.filter(a => (a.status || "").toLowerCase() === "completed").length;
    const cancelled = appointments.filter(a => (a.status || "").toLowerCase() === "cancelled").length;

    return { total, upcoming, pending, completed, cancelled };
  }, [appointments]);

  // Handle View Modal
  const handleOpenViewModal = (apt) => {
    setSelectedAppointment(apt);
    setModalStatus(apt.status || "Upcoming");
    setIsViewModalOpen(true);
  };

  // Save Status Change from Modal
  const handleSaveStatusChange = () => {
    if (selectedAppointment && modalStatus) {
      updateAppointmentStatus(selectedAppointment.id, modalStatus);
      setAppointments(getAppointments());
      setSelectedAppointment({ ...selectedAppointment, status: modalStatus });
      setIsViewModalOpen(false);
    }
  };

  // Filtered Appointments Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // 1. Search filter (Patient, Doctor, Appointment ID)
      const query = searchTerm.toLowerCase().trim();
      const pName = (apt.patientName || "Rahul Sharma").toLowerCase();
      const dName = (apt.doctorName || "Dr. Emily Carter").toLowerCase();
      const aptId = (apt.id || "").toLowerCase();

      const matchesSearch = !query || pName.includes(query) || dName.includes(query) || aptId.includes(query);

      // 2. Tab Status filter
      let matchesTab = true;
      if (activeTab !== "All") {
        const s = (apt.status || "").toLowerCase();
        const normStatus = (s === 'scheduled' || s === 'confirmed') ? 'upcoming' : s;
        matchesTab = normStatus === activeTab.toLowerCase();
      }

      // 3. Date filter
      let matchesDate = true;
      const todayStr = new Date().toISOString().split('T')[0];

      if (dateFilter === "Today") {
        matchesDate = apt.date === todayStr;
      } else if (dateFilter === "Upcoming") {
        matchesDate = apt.date >= todayStr;
      } else if (dateFilter === "Custom" && customDate) {
        matchesDate = apt.date === customDate;
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
                const patientName = apt.patientName || "Rahul Sharma";
                const doctorName = apt.doctorName || "Dr. Emily Carter";
                const cleanDocName = doctorName.startsWith("Dr.") ? doctorName : `Dr. ${doctorName}`;
                const { date, time } = formatDateTime(apt.date, apt.time);

                return (
                  <tr key={apt.id}>
                    {/* APPOINTMENT ID (Smaller & Muted) */}
                    <td>
                      <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "500", wordBreak: "break-word" }}>
                        {apt.id}
                      </span>
                    </td>

                    {/* PATIENT (Name Only) */}
                    <td>
                      <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {patientName}
                      </span>
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
                          title="View Appointment"
                          onClick={() => handleOpenViewModal(apt)}
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
                  {selectedAppointment.patientName || "Rahul Sharma"}
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
