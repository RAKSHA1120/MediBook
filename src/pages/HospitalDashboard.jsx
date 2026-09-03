import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  getCurrentUser,
  getHospitals
} from "../utils/storage";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import "./AdminDashboard.css";
import "./AdminShared.css";

function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Load backend Doctors and Appointments for current hospital
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const user = getCurrentUser();
    const hospitals = getHospitals();
    const hosRecord = hospitals.find((h) => h.id === user?.refId || h.name === user?.name) || {
      id: user?.refId || 1,
      name: user?.name || "MediCare Hospital"
    };

    setHospital(hosRecord);

    const hosIdInt = parseInt(String(hosRecord.id || user?.refId || user?.id || "").replace(/\D/g, ""), 10);
    const hosNameStr = String(hosRecord.name || user?.name || "").trim().toLowerCase();

    try {
      const [doctorsRes, apptsRes] = await Promise.all([
        fetch("https://localhost:7050/api/Doctors"),
        fetch("https://localhost:7050/api/Appointments")
      ]);

      if (!doctorsRes.ok || !apptsRes.ok) {
        throw new Error(`Server returned error (Doctors: ${doctorsRes.status}, Appointments: ${apptsRes.status})`);
      }

      const doctorsData = await doctorsRes.json();
      const apptsData = await apptsRes.json();

      // Filter Doctors for current hospital
      const filteredDocs = (Array.isArray(doctorsData) ? doctorsData : []).filter((doc) => {
        const docHosIdInt = parseInt(String(doc.hospitalId || doc.hospital?.id || "").replace(/\D/g, ""), 10);
        const docHosNameStr = String(doc.hospital?.name || doc.hospitalName || "").trim().toLowerCase();

        if (hosIdInt && docHosIdInt && hosIdInt === docHosIdInt) return true;
        if (hosNameStr && docHosNameStr && (hosNameStr === docHosNameStr || hosNameStr.includes(docHosNameStr) || docHosNameStr.includes(hosNameStr))) return true;
        if ((!hosIdInt || hosIdInt === 1) && (!docHosIdInt || docHosIdInt === 1)) return true;
        return false;
      });

      // Filter Appointments for current hospital
      const normalizedAppts = (Array.isArray(apptsData) ? apptsData : []).map(normalizeBackendAppointment);
      const filteredAppts = normalizedAppts.filter((apt) => {
        const aptHosIdInt = parseInt(String(apt.hospitalId || "").replace(/\D/g, ""), 10);
        const aptHosNameStr = String(apt.hospitalName || "").trim().toLowerCase();

        if (hosIdInt && aptHosIdInt && hosIdInt === aptHosIdInt) return true;
        if (hosNameStr && aptHosNameStr && (hosNameStr === aptHosNameStr || hosNameStr.includes(aptHosNameStr) || aptHosNameStr.includes(hosNameStr))) return true;
        if ((!hosIdInt || hosIdInt === 1) && (!aptHosIdInt || aptHosIdInt === 1)) return true;
        return false;
      });

      // Extract unique Patients associated with this hospital's appointments
      const patientIdsSet = new Set();
      filteredAppts.forEach((apt) => {
        if (apt.patientId) patientIdsSet.add(String(apt.patientId));
        else if (apt.patientName) patientIdsSet.add(apt.patientName.toLowerCase().trim());
      });

      setDoctors(filteredDocs);
      setAppointments(filteredAppts);
      setPatients(Array.from(patientIdsSet));
    } catch (err) {
      console.error("Error loading hospital dashboard data:", err);
      setError("Unable to connect to backend server. Please verify ASP.NET Core API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener("medibook_appointments_updated", loadData);
    window.addEventListener("medibook_hospitals_updated", loadData);
    return () => {
      window.removeEventListener("medibook_appointments_updated", loadData);
      window.removeEventListener("medibook_hospitals_updated", loadData);
    };
  }, [loadData]);

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

  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const s = String(a.status || "").trim().toLowerCase();
      if (s === "cancelled") return false;
      return isTodayDate(a.date);
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const statusLower = String(a.status || "").toLowerCase();
      return statusLower === "upcoming" || statusLower === "confirmed" || statusLower === "pending";
    });
  }, [appointments]);

  const getInitials = (name = "") => {
    if (!name) return "H";
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
      {/* Page Heading & Subtitle */}
      <section className="greeting-section" style={{ marginBottom: "24px" }}>
        <h2 className="greeting-title">
          Welcome back, {hospital?.name || "MediCare Hospital"}!
        </h2>
        <p className="greeting-subtitle">
          Here is an overview of your hospital, doctors, appointments, and patients.
        </p>
      </section>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
          <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
            Loading hospital dashboard metrics...
          </p>
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load dashboard metrics"
          description={error}
          icon={AlertCircle}
          actionLabel="Try Again"
          onAction={loadData}
        />
      ) : (
        <>
          {/* 1. Four Statistic KPI Cards Grid */}
          <section className="admin-stats-grid">
            {/* Card 1: Total Doctors */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Total Doctors</span>
                <div className="admin-stat-icon-wrapper">
                  <Stethoscope size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{doctors.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Doctors registered under your hospital</div>
            </div>

            {/* Card 2: Today's Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Today's Appointments</span>
                <div className="admin-stat-icon-wrapper">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{todayAppointments.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Appointments scheduled for today</div>
            </div>

            {/* Card 3: Upcoming Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Upcoming Appointments</span>
                <div className="admin-stat-icon-wrapper">
                  <Clock size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{upcomingAppointments.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Confirmed and pending appointments</div>
            </div>

            {/* Card 4: Registered Patients */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">Registered Patients</span>
                <div className="admin-stat-icon-wrapper">
                  <Users size={20} />
                </div>
              </div>
              <div className="admin-stat-number">{patients.length}</div>
              <div className="admin-stat-divider" />
              <div className="admin-stat-subtext">Patients with appointments at your hospital</div>
            </div>
          </section>

          {/* 2. Today's Appointments Compact Preview Section */}
          <Card style={{ marginBottom: "28px" }}>
            <div className="section-header" style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 className="section-main-title" style={{ margin: 0 }}>
                  Today's Appointments
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                  Scheduled appointments preview for {hospital?.name || "MediCare Hospital"}
                </p>
              </div>
              <button
                className="view-all-link"
                onClick={() => navigate("/hospital/appointments")}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>DOCTOR</th>
                    <th>TIME</th>
                    <th>REASON / TYPE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.slice(0, 5).map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <div className="user-info-cell">
                          <div className="user-avatar">{getInitials(apt.patientName || "P")}</div>
                          <div className="user-details">
                            <span className="user-name">{apt.patientName || "Patient"}</span>
                            <span className="user-subtext">{apt.patientId || "P-101"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: "600", color: "var(--text-heading)" }}>
                          {apt.doctorName || "Doctor"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: "600", color: "var(--primary)" }}>{apt.time}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          {apt.type || apt.specialty || "Consultation"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={apt.status || "Confirmed"} />
                      </td>
                    </tr>
                  ))}
                  {todayAppointments.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
                        No appointments scheduled for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}

export default HospitalDashboard;
