import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateAppointmentStatus, getCurrentUser, getCurrentDoctor } from "../utils/storage";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ClipboardList,
  UserCheck,
  Loader2
} from "lucide-react";
import "../pages/AdminShared.css";
import "../pages/AdminDashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);

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

  const loadDoctorData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    setCurrentUser(user);
    setCurrentDoctor(doc);

    const rawDocId = doc?.id ?? user?.refId ?? user?.id;
    const rawDocName = doc?.name ?? user?.name;

    const docIdInt = parseInt(String(rawDocId || "").replace(/\D/g, ""), 10);
    const normDocName = String(rawDocName || "").trim().toLowerCase();

    try {
      const response = await fetch("https://localhost:7050/api/Appointments");
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const allApiAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];

      // Filter appointments belonging to current doctor
      const myAppts = allApiAppts.filter((apt) => {
        const aptDocIdInt = parseInt(String(apt.doctorId || "").replace(/\D/g, ""), 10);
        const aptDocNameStr = String(apt.doctorName || "").trim().toLowerCase();

        // 1. Doctor ID match
        if (docIdInt && aptDocIdInt && docIdInt === aptDocIdInt) return true;

        // 2. Doctor Name match
        if (normDocName && aptDocNameStr && (normDocName === aptDocNameStr || normDocName.includes(aptDocNameStr) || aptDocNameStr.includes(normDocName))) return true;

        // 3. Fallback for doctor ID 1 / default doctor if no specific doctor ID
        if ((!docIdInt || docIdInt === 1) && (!aptDocIdInt || aptDocIdInt === 1)) return true;

        return false;
      });

      setAppointments(myAppts);
    } catch (err) {
      console.error("Error loading doctor dashboard appointments from backend:", err);
      setError("Unable to connect to backend server. Please check if ASP.NET Core API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctorData();
    const handleUpdate = () => loadDoctorData();
    window.addEventListener("medibook_appointments_updated", handleUpdate);
    return () => {
      window.removeEventListener("medibook_appointments_updated", handleUpdate);
    };
  }, [loadDoctorData]);

  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    const cleanDate = String(dateStr).trim().toLowerCase();
    if (cleanDate.includes("today")) return true;

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const todayISO = `${yyyy}-${mm}-${dd}`;

    if (cleanDate === todayISO) return true;

    try {
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return (
          parsedDate.getFullYear() === d.getFullYear() &&
          parsedDate.getMonth() === d.getMonth() &&
          parsedDate.getDate() === d.getDate()
        );
      }
    } catch (e) {}

    return false;
  };

  const todaysAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status || "").trim().toLowerCase();
      if (s === "cancelled") return false;
      return isTodayDate(a.date);
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status || "").trim().toLowerCase();
      if (s === "cancelled") return false;
      return s === "upcoming" || s === "confirmed" || s === "scheduled";
    });
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status || "").trim().toLowerCase();
      return s === "completed";
    });
  }, [appointments]);

  const pendingAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status || "").trim().toLowerCase();
      if (s === "cancelled") return false;
      return s === "pending";
    });
  }, [appointments]);

  const handleStatusChange = (id, newStatus) => {
    updateAppointmentStatus(id, newStatus);
    setAppointments((prev) =>
      prev.map((a) => (String(a.id) === String(id) ? { ...a, status: newStatus } : a))
    );
  };

  // Format doctor name cleanly
  const rawName = currentDoctor?.name || currentUser?.name || "Doctor";
  const doctorDisplayName = rawName.toLowerCase().startsWith("dr.") ? rawName : `Dr. ${rawName}`;

  return (
    <main className="patient-dashboard-content">
      {/* 1. Header / Page Introduction */}
      <section className="greeting-section">
        <h2 className="greeting-title">Welcome back, {doctorDisplayName}!</h2>
        <p className="greeting-subtitle">Here is an overview of your schedule and patients.</p>
      </section>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
          <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
            Loading doctor schedule and appointments...
          </p>
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load schedule"
          description={error}
          icon={AlertCircle}
          actionLabel="Try Again"
          onAction={loadDoctorData}
        />
      ) : (
        <>
          {/* 2. Stat Cards Grid (4 equal width KPI cards) */}
          <section className="admin-stats-grid">
            {/* Today's Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Today's Appointments</span>
                <div className="admin-stat-icon-wrapper">
                  <CalendarCheck size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{todaysAppointments.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Scheduled for today</div>
            </div>

            {/* Upcoming Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Upcoming Appointments</span>
                <div className="admin-stat-icon-wrapper">
                  <Clock size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{upcomingAppointments.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Confirmed & upcoming</div>
            </div>

            {/* Completed Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Completed Appointments</span>
                <div className="admin-stat-icon-wrapper">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{completedAppointments.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Completed consultations</div>
            </div>

            {/* Pending Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Pending Appointments</span>
                <div className="admin-stat-icon-wrapper">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{pendingAppointments.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Awaiting confirmation</div>
            </div>
          </section>

          {/* 3. Today's Appointments Section */}
          <section className="dashboard-main-info-grid" style={{ gridTemplateColumns: "1fr", marginBottom: "28px" }}>
            <div className="next-appointment-column">
              <div className="section-header">
                <h3 className="section-main-title">Today's Appointments</h3>
                <Link to="/doctor/appointments" className="view-all-link">
                  View All
                </Link>
              </div>
              <div className="admin-table-card">
                {todaysAppointments.length === 0 ? (
                  <div style={{ padding: "36px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p className="no-activity-text" style={{ fontSize: "14px", margin: 0 }}>
                      No appointments scheduled for today.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Time</th>
                          <th>Reason / Specialty</th>
                          <th>Status</th>
                          <th>Update Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysAppointments.map((apt) => (
                          <tr key={apt.id}>
                            <td>
                              <div className="user-info-cell">
                                <div className="user-avatar">
                                  {(apt.patientName || apt.patient || "P").charAt(0).toUpperCase()}
                                </div>
                                <div className="user-details">
                                  <span className="user-name">{apt.patientName || apt.patient || "Patient"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="nowrap">{apt.time || "10:00 AM"}</td>
                            <td>{apt.type || apt.specialty || "Consultation"}</td>
                            <td className="nowrap">
                              <StatusBadge status={apt.status} />
                            </td>
                            <td>
                              <select
                                className="field-select"
                                value={apt.status}
                                onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "var(--radius-sm)",
                                  border: "1px solid var(--border)",
                                  minWidth: "115px",
                                  fontSize: "13px",
                                  backgroundColor: "var(--surface)",
                                  color: "var(--text-heading)",
                                  cursor: "pointer"
                                }}
                              >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Pending">Pending</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 4. Lower Section: Two-Column Grid (Upcoming Appointments & Recent Patients) */}
          <section className="dashboard-main-info-grid">
            {/* Left Column: Upcoming Appointments */}
            <div className="next-appointment-column">
              <div className="section-header">
                <h3 className="section-main-title">Upcoming Schedule</h3>
                <Link to="/doctor/appointments" className="view-all-link">
                  View All
                </Link>
              </div>
              <div className="recent-activity-card">
                <div className="recent-activity-list">
                  {upcomingAppointments.length === 0 ? (
                    <p className="no-activity-text">No upcoming appointments scheduled</p>
                  ) : (
                    upcomingAppointments.slice(0, 4).map((apt) => (
                      <div key={apt.id} className="activity-item" style={{ cursor: "default" }}>
                        <div className="activity-icon-container">
                          <ClipboardList size={18} className="activity-icon reminder" />
                        </div>
                        <div className="activity-content">
                          <div className="activity-title-row">
                            <h4 className="activity-title">
                              {apt.patientName || apt.patient || "Patient"}
                            </h4>
                            <StatusBadge status={apt.status} />
                          </div>
                          <p className="activity-message">
                            {apt.type || "Consultation"} &bull; {apt.date} at {apt.time || "09:00 AM"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Doctor Recent Consultations */}
            <div className="quick-actions-column">
              <div className="section-header">
                <h3 className="section-main-title">Recent Consultations</h3>
                <Link to="/doctor/appointments" className="view-all-link">
                  View All
                </Link>
              </div>
              <div className="recent-activity-card">
                <div className="recent-activity-list">
                  {appointments.length === 0 ? (
                    <p className="no-activity-text">No recent consultation records</p>
                  ) : (
                    appointments.slice(0, 4).map((apt) => (
                      <div
                        key={`pat-${apt.id}`}
                        className="activity-item"
                        onClick={() => navigate("/doctor/appointments")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="activity-icon-container">
                          <UserCheck size={18} className="activity-icon confirmed" />
                        </div>
                        <div className="activity-content">
                          <div className="activity-title-row">
                            <h4 className="activity-title">
                              {apt.patientName || apt.patient || "Patient"}
                            </h4>
                            <span className="registration-type-badge patient">Patient</span>
                          </div>
                          <p className="activity-message">
                            Last Visit: {apt.date} &bull; {apt.type || "General Checkup"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default Dashboard;