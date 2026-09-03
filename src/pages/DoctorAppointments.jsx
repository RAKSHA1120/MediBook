import { useState, useEffect, useMemo } from "react";
import { Search, Eye, Calendar, CalendarCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getAppointmentsForDoctor, updateAppointmentStatus, getCurrentUser, getCurrentDoctor, getPatients } from "../utils/storage";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import "../pages/AdminShared.css";
import "../pages/AdminDashboard.css";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescribedMedicines, setPrescribedMedicines] = useState("");

  useEffect(() => {
    loadAppointments();
    window.addEventListener("medibook_appointments_updated", loadAppointments);
    return () => window.removeEventListener("medibook_appointments_updated", loadAppointments);
  }, []);

  const loadAppointments = () => {
    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    if (user || doc) {
      const docId = doc?.id ?? user?.refId ?? user?.id;
      const docName = doc?.name ?? user?.name;
      const myAppts = getAppointmentsForDoctor(docId, docName);
      setAppointments(myAppts);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateAppointmentStatus(id, newStatus);
    loadAppointments();
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
    const allPatients = getPatients();
    const allUsers = JSON.parse(localStorage.getItem("medibook_users") || "[]");

    const patientInfo = allPatients.find((p) => {
      const pIdStr = String(p.id ?? "").trim();
      const pNameStr = String(p.name ?? "").toLowerCase().trim();
      const aptPIdStr = String(apt.patientId ?? "").trim();
      const aptPNameStr = String(apt.patientName || apt.patient || "").toLowerCase().trim();

      return (aptPIdStr !== "" && pIdStr === aptPIdStr) || (aptPNameStr !== "" && pNameStr === aptPNameStr);
    });

    const patientUser = allUsers.find(
      (u) => u.refId === apt.patientId || (patientInfo && u.refId === patientInfo.id)
    );

    let extraProfile = {};
    if (patientUser) {
      try {
        const extraStr = localStorage.getItem(`medibook_profile_${patientUser.id}`);
        if (extraStr) extraProfile = JSON.parse(extraStr);
      } catch (e) {}
    }

    const rawPId = String(apt.patientId ?? "").trim();
    const validPId =
      rawPId !== "" && rawPId.toLowerCase() !== "n/a" ? rawPId : patientInfo?.id ? String(patientInfo.id) : null;

    setSelectedAppointment({
      ...apt,
      patientName: String(apt.patientName || apt.patient || patientInfo?.name || "Patient").trim(),
      patientId: validPId,
      contact: extraProfile.phone || patientInfo?.contact || patientInfo?.phone || "N/A",
      email: extraProfile.email || patientInfo?.email || "N/A",
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

      {/* 5. Appointments Table / Empty State */}
      <div className="admin-table-card">
        {filteredAppointments.length === 0 ? (
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
                        <div className="user-info-cell">
                          <div className="user-avatar">{initials}</div>
                          <div className="user-details">
                            <span className="user-name">{rawPatientName}</span>
                            {patientIdDisplay && (
                              <span className="user-subtext">{patientIdDisplay}</span>
                            )}
                          </div>
                        </div>
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
            <div className="modal-actions" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                {selectedAppointment.status !== "Cancelled" && selectedAppointment.status !== "Completed" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(selectedAppointment.id, "Cancelled");
                      setIsDetailsModalOpen(false);
                    }}
                  >
                    Cancel Appointment
                  </Button>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </Button>
                {selectedAppointment.status !== "Completed" && selectedAppointment.status !== "Cancelled" && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleStatusChange(selectedAppointment.id, "Confirmed");
                        setIsDetailsModalOpen(false);
                      }}
                    >
                      Confirm
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

            <div className="modal-actions" style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  const prescriptions = JSON.parse(localStorage.getItem("medibook_prescriptions") || "[]");
                  prescriptions.push({
                    id: Date.now(),
                    appointmentId: selectedAppointment.id,
                    patientId: selectedAppointment.patientId,
                    doctorId: selectedAppointment.doctorId,
                    date: selectedAppointment.date,
                    notes: consultationNotes,
                    medicines: prescribedMedicines
                  });
                  localStorage.setItem("medibook_prescriptions", JSON.stringify(prescriptions));

                  handleStatusChange(selectedAppointment.id, "Completed");
                  setIsPrescriptionModalOpen(false);
                  setConsultationNotes("");
                  setPrescribedMedicines("");
                }}
              >
                Save & Complete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}

export default DoctorAppointments;
