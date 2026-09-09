import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Eye, Calendar, CalendarCheck, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";
import { api } from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import ProfileModalTrigger from "../components/ProfileModalTrigger";
import "../pages/AdminShared.css";
import "../pages/AdminDashboard.css";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState("");
  const [doctorAdvice, setDoctorAdvice] = useState("");

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
      notes: apt.notes || null,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    };
  };

  // Load appointments from backend API GET /api/Appointments
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getCurrentUser();
      const doc = getCurrentDoctor();
      const rawDocId = user?.doctorId || user?.refId || doc?.refId || user?.id;
      const docIdInt = rawDocId || "";

      if (!docIdInt) {
         setAppointments([]);
         return;
      }
      
      const response = await api.get(`/Appointments/doctor/${docIdInt}`);
      if (!response.success) {
        throw new Error(response.error || "Failed to load appointments");
      }
      const data = response.data;
      const myAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];

      setAppointments(myAppts);
    } catch (err) {
      console.error("Error loading doctor appointments from backend:", err);
      setError("Unable to connect to backend server. Please verify ASP.NET Core API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    window.addEventListener("medibook_appointments_updated", loadAppointments);
    return () => window.removeEventListener("medibook_appointments_updated", loadAppointments);
  }, [loadAppointments]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/Appointments/${id}/status`, { status: newStatus });
      if (response.success) {
        setAppointments((prev) =>
          prev.map((a) => (String(a.id) === String(id) ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleConfirm = async (apt) => {
    try {
      const user = getCurrentUser();
      const doc = getCurrentDoctor();
      const rawDocId = user?.doctorId || user?.refId || doc?.refId || user?.id;
      const response = await api.put(`/Appointments/${apt.id}/confirm`, { doctorId: Number(rawDocId) });
      if (response.success) {
        setAppointments((prev) =>
          prev.map((a) => String(a.id) === String(apt.id) ? { ...a, status: "Confirmed" } : a)
        );
        setSelectedAppointment((prev) => prev ? { ...prev, status: "Confirmed" } : null);
      } else {
        alert(response.error || "Failed to confirm appointment.");
      }
    } catch (err) {
      console.error("Failed to confirm appointment", err);
    }
  };

  const handleCancel = async (apt) => {
    try {
      const response = await api.put(`/Appointments/${apt.id}/cancel`);
      if (response.success) {
        setAppointments((prev) =>
          prev.map((a) => String(a.id) === String(apt.id) ? { ...a, status: "Cancelled" } : a)
        );
        setSelectedAppointment((prev) => prev ? { ...prev, status: "Cancelled" } : null);
      } else {
        alert(response.error || "Failed to cancel appointment.");
      }
    } catch (err) {
      console.error("Failed to cancel appointment", err);
    }
  };

  const openReschedule = (apt) => {
    setSelectedAppointment({ ...apt });
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      alert("Please select a new date and time.");
      return;
    }
    try {
      const user = getCurrentUser();
      const doc = getCurrentDoctor();
      const rawDocId = user?.doctorId || user?.refId || doc?.refId || user?.id;
      const [hh, mm] = rescheduleTime.split(":");
      const response = await api.put(`/Appointments/${selectedAppointment.id}/reschedule`, {
        doctorId: Number(rawDocId),
        newAppointmentDate: rescheduleDate + "T00:00:00",
        newAppointmentTime: `${hh}:${mm}:00`,
        reason: rescheduleReason || null
      });
      if (response.success) {
        const newDate = rescheduleDate;
        const newTime = rescheduleTime;
        setAppointments((prev) =>
          prev.map((a) =>
            String(a.id) === String(selectedAppointment.id)
              ? { ...a, date: newDate, time: newTime, appointmentDate: rescheduleDate, status: "Confirmed" }
              : a
          )
        );
        setIsRescheduleModalOpen(false);
      } else {
        alert(response.error || "Failed to reschedule appointment.");
      }
    } catch (err) {
      console.error("Error rescheduling:", err);
    }
  };

  // Stats calculations
  const upcomingCount = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status ?? "").toLowerCase();
      return s === "upcoming" || s === "confirmed" || s === "scheduled";
    }).length;
  }, [appointments]);

  const pendingCount = useMemo(() => {
    return appointments.filter((a) => String(a.status ?? "").toLowerCase() === "pending").length;
  }, [appointments]);

  const completedCount = useMemo(() => {
    return appointments.filter((a) => String(a.status ?? "").toLowerCase() === "completed").length;
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const searchLower = String(searchTerm ?? "").toLowerCase().trim();
    const filterLower = String(statusFilter ?? "All").toLowerCase().trim();

    return appointments.filter((apt) => {
      const pName = String(apt.patientName || apt.patient || "").toLowerCase();
      const reason = String(apt.type || apt.reason || apt.specialty || "").toLowerCase();

      const matchesSearch =
        searchLower === "" || pName.includes(searchLower) || reason.includes(searchLower);

      let matchesStatus = true;
      if (filterLower !== "all") {
        const s = String(apt.status ?? "").toLowerCase();
        if (filterLower === "upcoming") {
          matchesStatus = s === "upcoming" || s === "confirmed" || s === "scheduled";
        } else {
          matchesStatus = s === filterLower;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const openDetails = (apt) => {
    setSelectedAppointment({
      ...apt,
      patientName: String(apt.patientName || apt.patient || "Patient").trim(),
      patientId: apt.patientId || "N/A",
      contact: "N/A", // API doesn't provide patient contact right now
      email: "N/A",
      reason: String(apt.type || apt.reason || apt.specialty || "Consultation").trim(),
      notes: apt.notes || "No additional notes provided."
    });
    setIsDetailsModalOpen(true);
  };

  return (
    <main className="patient-dashboard-content">
      {/* 1. Page Header */}
      <section className="greeting-section" style={{ marginBottom: "20px" }}>
        <h2 className="greeting-title">My Appointments</h2>
        <p className="greeting-subtitle">Manage your assigned patient appointments and schedules.</p>
      </section>

      {/* 2. Compact Statistics Cards Grid (4 KPI cards) */}
      <section className="admin-stats-grid" style={{ marginBottom: "20px" }}>
        {/* Total Appointments */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Appointments</span>
            <div className="admin-stat-icon-wrapper">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{appointments.length}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">All assigned appointments</div>
        </div>

        {/* Upcoming Appointments */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Upcoming Appointments</span>
            <div className="admin-stat-icon-wrapper">
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{upcomingCount}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Scheduled upcoming visits</div>
        </div>

        {/* Pending Appointments */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Pending Appointments</span>
            <div className="admin-stat-icon-wrapper">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{pendingCount}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Awaiting confirmation</div>
        </div>

        {/* Completed Appointments */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Completed Appointments</span>
            <div className="admin-stat-icon-wrapper">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{completedCount}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Completed consultations</div>
        </div>
      </section>

      {/* 3. Search and Filter Card */}
      <div
        className="filters-bar"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div className="filters-row" style={{ display: "flex", gap: "16px", width: "100%", alignItems: "center" }}>
          {/* Search Input */}
          <div className="filter-search-wrapper" style={{ flex: 1, position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search by patient name or reason..."
              className="form-input"
              style={{ paddingLeft: "42px", height: "44px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Select */}
          <div className="filter-select-wrapper" style={{ minWidth: "200px" }}>
            <select
              className="form-select"
              style={{ height: "44px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Appointment Count */}
      <div
        className="appointment-count-text"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--text-muted)",
          marginBottom: "12px"
        }}
      >
        Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong> appointments
      </div>

      {/* 5. Appointments Table / Empty State / Loading State */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
              Loading assigned appointments...
            </p>
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load appointments"
            description={error}
            icon={AlertCircle}
            actionLabel="Try Again"
            onAction={loadAppointments}
          />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No appointments found."
            description="We couldn't find any appointments matching your search query or status filter."
            icon={Calendar}
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("All");
            }}
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PATIENT</th>
                  <th>DATE & TIME</th>
                  <th>REASON</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const rawPatientName = String(apt.patientName || apt.patient || "Patient").trim();
                  const initials = rawPatientName
                    .split(" ")
                    .map((n) => (n && n[0] ? n[0] : ""))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "P";

                  const rawPId = String(apt.patientId ?? "").trim();
                  const patientIdDisplay =
                    rawPId !== "" && rawPId.toLowerCase() !== "n/a" ? rawPId : null;

                  const formattedReason = String(apt.type || apt.reason || apt.specialty || "Consultation").trim();

                  return (
                    <tr key={apt.id}>
                      <td>
                        <ProfileModalTrigger type="patient" id={apt.patientId}>
                          <div className="user-info-cell">
                            <div className="user-avatar">{initials}</div>
                            <div className="user-details">
                              <span className="user-name">{rawPatientName}</span>
                              {patientIdDisplay && (
                                <span className="user-subtext">{patientIdDisplay}</span>
                              )}
                            </div>
                          </div>
                        </ProfileModalTrigger>
                      </td>
                      <td className="nowrap">
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: "600", color: "var(--text-heading)" }}>
                            {apt.date || "Today"}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {apt.time || "10:00 AM"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: "500" }}>{formattedReason}</span>
                      </td>
                      <td className="nowrap">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="nowrap" style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="icon-action-btn"
                          title="View Appointment"
                          onClick={() => openDetails(apt)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--primary)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Appointment Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="appointment-details-modal" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Patient Name:</span>
              <span className="detail-value" style={{ fontWeight: "700", color: "var(--text-heading)", fontSize: "15px" }}>{selectedAppointment.patientName}</span>
            </div>

            {selectedAppointment.patientId && (
              <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
                <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Patient ID:</span>
                <span className="detail-value" style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" }}>{selectedAppointment.patientId}</span>
              </div>
            )}

            <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Date & Time:</span>
              <span className="detail-value" style={{ fontWeight: "600", color: "var(--text-heading)", fontSize: "14px" }}>{selectedAppointment.date} at {selectedAppointment.time}</span>
            </div>

            <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Reason / Type:</span>
              <span className="detail-value" style={{ fontWeight: "600", color: "var(--text-heading)", fontSize: "14px" }}>{selectedAppointment.reason}</span>
            </div>

            <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Status:</span>
              <span className="detail-value"><StatusBadge status={selectedAppointment.status} /></span>
            </div>

            <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Contact Phone:</span>
              <span className="detail-value" style={{ color: "var(--text-primary)", fontSize: "14px" }}>{selectedAppointment.contact}</span>
            </div>

            <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Email Address:</span>
              <span className="detail-value" style={{ color: "var(--text-primary)", fontSize: "14px" }}>{selectedAppointment.email}</span>
            </div>

            <div className="detail-row" style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}>
              <span className="detail-label" style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "14px" }}>Appointment Notes:</span>
              <span className="detail-value" style={{ color: "var(--text-primary)", fontStyle: "italic", fontSize: "13.5px", lineHeight: "1.5" }}>{selectedAppointment.notes}</span>
            </div>

            {/* Modal Actions Footer */}
            <div className="modal-actions" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div>
                {selectedAppointment.status !== "Cancelled" && selectedAppointment.status !== "Completed" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCancel(selectedAppointment);
                      setIsDetailsModalOpen(false);
                    }}
                    style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                  >
                    Cancel Appointment
                  </Button>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
                {/* PENDING: Show Confirm and Reschedule only */}
                {(selectedAppointment.status === "Pending") && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleConfirm(selectedAppointment);
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        openReschedule(selectedAppointment);
                      }}
                    >
                      Reschedule
                    </Button>
                  </>
                )}
                {/* CONFIRMED: Show Complete Consultation and Reschedule */}
                {selectedAppointment.status === "Confirmed" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        openReschedule(selectedAppointment);
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        setIsPrescriptionModalOpen(true);
                      }}
                    >
                      Complete Consultation
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Prescription / Consultation Notes Modal */}
      <Modal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        title="Complete Consultation"
      >
        {selectedAppointment && (
          <div className="prescription-modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>
              Add consultation notes and prescriptions for <strong>{selectedAppointment.patientName || selectedAppointment.patient}</strong>. This will be available in their medical records.
            </p>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>Consultation Notes / Diagnosis</label>
              <textarea
                className="field-input"
                rows="4"
                placeholder="E.g., Patient presented with mild fever and sore throat..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                style={{ resize: "vertical", minHeight: "100px" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>Prescribed Medicines</label>
              <textarea
                className="field-input"
                rows="3"
                placeholder="E.g., Paracetamol 500mg - 1-0-1 for 3 days"
                value={prescribedMedicines}
                onChange={(e) => setPrescribedMedicines(e.target.value)}
                style={{ resize: "vertical", minHeight: "80px" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>Doctor Notes / Advice</label>
              <textarea
                className="field-input"
                rows="3"
                placeholder="E.g., Take adequate rest and drink plenty of water"
                value={doctorAdvice}
                onChange={(e) => setDoctorAdvice(e.target.value)}
                style={{ resize: "vertical", minHeight: "80px" }}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  const completeConsultation = async () => {
                    try {
                        const putPayload = {
                            doctorId: selectedAppointment.doctorId,
                            diagnosis: consultationNotes,
                            prescription: prescribedMedicines,
                            advice: doctorAdvice
                        };
                        
                        const putResponse = await api.put(`/Appointments/${selectedAppointment.id}/complete`, putPayload);

                        if (putResponse.success) {
                            const updatedAppt = putResponse.data;
                            setAppointments((prev) =>
                              prev.map((a) => (String(a.id) === String(selectedAppointment.id) ? { ...a, status: "Completed", notes: updatedAppt.notes } : a))
                            );
                        } else {
                            console.error("Failed to complete appointment:", putResponse.error);
                        }
                    } catch (e) {
                        console.error("Error completing consultation:", e);
                    }
                    
                    setIsPrescriptionModalOpen(false);
                    setConsultationNotes("");
                    setPrescribedMedicines("");
                    setDoctorAdvice("");
                  };
                  
                  completeConsultation();
                }}
              >
                Save & Complete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Appointment Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title="Reschedule Appointment"
      >
        {selectedAppointment && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Current appointment info */}
            <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius)", padding: "12px 14px", border: "1px solid var(--border)" }}>
              <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>Current Appointment</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>
                {selectedAppointment.date || "N/A"} &nbsp;·&nbsp; {selectedAppointment.time || "N/A"}
              </p>
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>
                New Date <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={rescheduleDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{ height: "44px" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>
                New Time <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="time"
                className="form-input"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                style={{ height: "44px" }}
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>
                Reason <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                className="field-input"
                rows="3"
                placeholder="E.g., Doctor unavailable, patient requested change..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                style={{ resize: "vertical", minHeight: "80px" }}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleReschedule}>Confirm Reschedule</Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default DoctorAppointments;
