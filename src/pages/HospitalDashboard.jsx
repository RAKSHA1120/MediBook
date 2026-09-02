import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  UserCheck,
  CalendarCheck
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
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter(
    (a) => a.date === todayStr || String(a.date).toLowerCase().includes("today")
  );

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

      {/* 2. Today's Appointments Card */}
      <Card style={{ marginBottom: "28px" }}>
        <div className="section-header" style={{ marginBottom: "16px" }}>
          <div>
            <h3 className="section-main-title" style={{ margin: 0 }}>
              Today's Appointments
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Scheduled appointments for {hospital?.name || "MediCare Hospital"} today
            </p>
          </div>
          <button
            className="view-all-link"
            onClick={() => navigate("/hospital/appointments")}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
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

      {/* 3. Upcoming Appointments Card */}
      <Card style={{ marginBottom: "28px" }}>
        <div className="section-header" style={{ marginBottom: "16px" }}>
          <div>
            <h3 className="section-main-title" style={{ margin: 0 }}>
              Upcoming Appointments
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Future consultations scheduled across your facility
            </p>
          </div>
          <button
            className="view-all-link"
            onClick={() => navigate("/hospital/appointments")}
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
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
                <th>DATE & TIME</th>
                <th>SPECIALTY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {upcomingAppointments.slice(0, 5).map((apt) => (
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
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "600", color: "var(--text-heading)" }}>{apt.date}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{apt.time}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {apt.specialty || apt.type || "General Medicine"}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={apt.status || "Confirmed"} />
                  </td>
                </tr>
              ))}
              {upcomingAppointments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
                    No upcoming appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Two Column Grid: Our Doctors & Recent Patients */}
      <div className="dashboard-main-info-grid">
        {/* Column A: Our Doctors */}
        <div>
          <div className="section-header">
            <h3 className="section-main-title">Our Doctors</h3>
            <button className="view-all-link" onClick={() => navigate("/hospital/doctors")}>
              View All Doctors
            </button>
          </div>

          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {doctors.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-soft)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "14px"
                      }}
                    >
                      {getInitials(doc.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-heading)" }}>
                        {doc.name.startsWith("Dr.") ? doc.name : `Dr. ${doc.name}`}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                        {doc.specialization || doc.specialty || "General Medicine"} • {doc.experience || "5 yrs"}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={doc.status || "Active"} />
                </div>
              ))}

              {doctors.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--text-muted)", fontSize: "14px" }}>
                  No doctors registered under this hospital yet.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Column B: Recent Patients */}
        <div>
          <div className="section-header">
            <h3 className="section-main-title">Recent Patients</h3>
            <button className="view-all-link" onClick={() => navigate("/hospital/patients")}>
              View All
            </button>
          </div>

          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {patients.slice(0, 5).map((pat) => (
                <div
                  key={pat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(47, 111, 163, 0.1)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "14px"
                      }}
                    >
                      {getInitials(pat.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-heading)" }}>
                        {pat.name}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                        ID: {pat.id} • {pat.gender || "Patient"}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={pat.status || "Active"} />
                </div>
              ))}

              {patients.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--text-muted)", fontSize: "14px" }}>
                  No recent patients associated with your hospital yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default HospitalDashboard;
