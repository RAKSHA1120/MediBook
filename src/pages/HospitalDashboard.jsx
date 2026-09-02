import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Calendar,
  Clock,
  Users,
  ChevronRight
} from "lucide-react";
import {
  getCurrentUser,
  getHospitals,
  getHospitalDoctors,
  getHospitalAppointments,
  getHospitalPatients
} from "../utils/storage";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import "./AdminDashboard.css";
import "./AdminShared.css";

function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const loadData = () => {
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
      const hosAppts = getHospitalAppointments(identifier);
      const hosPatients = getHospitalPatients(identifier);

      setDoctors(hosDocs);
      setAppointments(hosAppts);
      setPatients(hosPatients);
    };

    loadData();
    window.addEventListener("medibook_appointments_updated", loadData);
    window.addEventListener("medibook_hospitals_updated", loadData);
    return () => {
      window.removeEventListener("medibook_appointments_updated", loadData);
      window.removeEventListener("medibook_hospitals_updated", loadData);
    };
  }, []);

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

  const todayAppointments = appointments.filter((a) => {
    const s = String(a.status || "").trim().toLowerCase();
    if (s === "cancelled") return false;
    return isTodayDate(a.date);
  });

  const upcomingAppointments = appointments.filter((a) => {
    const statusLower = String(a.status || "").toLowerCase();
    return statusLower === "upcoming" || statusLower === "confirmed" || statusLower === "pending";
  });

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
    </main>
  );
}

export default HospitalDashboard;
