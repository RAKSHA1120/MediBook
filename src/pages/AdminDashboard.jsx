import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Building2,
  Stethoscope,
  Users,
  CalendarCheck,
  Clock,
  UserCheck,
  ClipboardList,
  UserPlus
} from "lucide-react";
import { getDoctors, getPatients, getAppointments } from "../utils/storage";
import { getHospitalsStorage } from "./AdminHospitals";
import StatusBadge from "../components/StatusBadge";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    activeDoctors: 0
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener("medibook_appointments_updated", handleUpdate);
    window.addEventListener("medibook_hospitals_updated", handleUpdate);

    return () => {
      window.removeEventListener("medibook_appointments_updated", handleUpdate);
      window.removeEventListener("medibook_hospitals_updated", handleUpdate);
    };
  }, []);

  const loadDashboardData = () => {
    const docs = getDoctors();
    const pats = getPatients();
    const appts = getAppointments();
    const hospitals = getHospitalsStorage();

    const todayStr = new Date().toISOString().split("T")[0];

    // Compute stats dynamically from mock data
    const todayCount = appts.filter(
      a => a.date === todayStr || String(a.date).toLowerCase().includes("today")
    ).length;

    const upcomingCount = appts.filter(
      a => a.status === "Upcoming" || a.status === "Confirmed" || a.status === "Pending"
    ).length;

    const activeDocsCount = docs.filter(
      d => d.status === "Active" || String(d.availability).toLowerCase().includes("today")
    ).length;

    setStats({
      totalHospitals: hospitals.length,
      totalDoctors: docs.length,
      totalPatients: pats.length,
      totalAppointments: appts.length,
      todayAppointments: todayCount,
      upcomingAppointments: upcomingCount,
      activeDoctors: activeDocsCount
    });

    // Recent Appointments (latest 4)
    setRecentAppointments(appts.slice(-4).reverse());

    // Recent Registrations (Doctors, Patients, Hospitals)
    const regs = [];

    docs.slice(-2).reverse().forEach(d => {
      regs.push({
        id: `reg-doc-${d.id}`,
        name: d.name.toLowerCase().startsWith("dr.") ? d.name : `Dr. ${d.name}`,
        type: "doctor",
        dateText: `${d.specialization || d.specialty || "Doctor"} • Registered`,
        navPath: "/admin/doctors"
      });
    });

    pats.slice(-2).reverse().forEach(p => {
      regs.push({
        id: `reg-pat-${p.id}`,
        name: p.name,
        type: "patient",
        dateText: `${p.date || "Today"} • Patient Account`,
        navPath: "/admin/patients"
      });
    });

    hospitals.slice(-2).reverse().forEach(h => {
      regs.push({
        id: `reg-hos-${h.id}`,
        name: h.name,
        type: "hospital",
        dateText: `${h.location} • Healthcare Facility`,
        navPath: "/admin/hospitals"
      });
    });

    setRecentRegistrations(regs);
  };

  return (
    <main className="patient-dashboard-content">
      {/* Greeting Header */}
      <section className="greeting-section">
        <h2 className="greeting-title">Welcome back, System Admin!</h2>
        <p className="greeting-subtitle">
          Here is an overview of MediBook's healthcare network and system operations today.
        </p>
      </section>

      {/* TIER 1: 4 MAIN KPI CARDS */}
      <section className="admin-stats-grid">
        {/* 1. Total Hospitals */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Hospitals</span>
            <div className="admin-stat-icon-wrapper">
              <Building2 size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.totalHospitals}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Registered healthcare facilities</div>
        </div>

        {/* 2. Total Doctors */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Doctors</span>
            <div className="admin-stat-icon-wrapper">
              <Stethoscope size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.totalDoctors}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Active medical professionals</div>
        </div>

        {/* 3. Total Patients */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Patients</span>
            <div className="admin-stat-icon-wrapper">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.totalPatients}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Registered system patients</div>
        </div>

        {/* 4. Total Appointments */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Appointments</span>
            <div className="admin-stat-icon-wrapper">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.totalAppointments}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Total scheduled visits</div>
        </div>
      </section>

      {/* TIER 2: COMPACT OPERATIONAL OVERVIEW BAR */}
      <section className="operational-overview-bar">
        {/* Today's Appointments */}
        <div className="operational-overview-item">
          <div className="operational-overview-icon">
            <Clock size={18} />
          </div>
          <div className="operational-overview-details">
            <div className="operational-overview-header">
              <span className="operational-overview-label">Today's Appointments</span>
              <span className="operational-overview-val">{stats.todayAppointments}</span>
            </div>
            <span className="operational-overview-subtext">Scheduled today</span>
          </div>
        </div>

        <div className="operational-overview-divider" />

        {/* Upcoming Appointments */}
        <div className="operational-overview-item">
          <div className="operational-overview-icon">
            <CalendarCheck size={18} />
          </div>
          <div className="operational-overview-details">
            <div className="operational-overview-header">
              <span className="operational-overview-label">Upcoming Appointments</span>
              <span className="operational-overview-val">{stats.upcomingAppointments}</span>
            </div>
            <span className="operational-overview-subtext">Confirmed & pending</span>
          </div>
        </div>

        <div className="operational-overview-divider" />

        {/* Active Doctors */}
        <div className="operational-overview-item">
          <div className="operational-overview-icon">
            <UserCheck size={18} />
          </div>
          <div className="operational-overview-details">
            <div className="operational-overview-header">
              <span className="operational-overview-label">Active Doctors</span>
              <span className="operational-overview-val">{stats.activeDoctors}</span>
            </div>
            <span className="operational-overview-subtext">Available for consultation</span>
          </div>
        </div>
      </section>

      {/* TIER 3: RECENT ACTIVITY (Recent Appointments & Recent Registrations) */}
      <section className="dashboard-main-info-grid">
        {/* Left Column: Recent Appointments */}
        <div className="next-appointment-column">
          <div className="section-header">
            <h3 className="section-main-title">Recent Appointments</h3>
            <button className="view-all-link" onClick={() => navigate("/admin/appointments")}>
              View All
            </button>
          </div>

          <div className="recent-activity-card">
            <div className="recent-activity-list">
              {recentAppointments.length === 0 ? (
                <p className="no-activity-text">No recent appointments</p>
              ) : null}
              {recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="activity-item"
                  onClick={() => navigate(`/admin/appointments/${apt.id}`)}
                >
                  <div className="activity-icon-container">
                    <ClipboardList size={18} className="activity-icon reminder" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <h4 className="activity-title">
                        {apt.patientName} &bull; {apt.doctorName}
                      </h4>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="activity-message">
                      {apt.specialty || apt.type || "General"} &bull; {apt.date} at {apt.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Registrations */}
        <div className="quick-actions-column">
          <div className="section-header">
            <h3 className="section-main-title">Recent Registrations</h3>
            <button className="view-all-link" onClick={() => navigate("/admin/doctors")}>
              View All
            </button>
          </div>

          <div className="recent-activity-card">
            <div className="recent-activity-list">
              {recentRegistrations.length === 0 ? (
                <p className="no-activity-text">No recent registrations</p>
              ) : null}
              {recentRegistrations.map((item) => (
                <div
                  key={item.id}
                  className="activity-item"
                  onClick={() => navigate(item.navPath)}
                >
                  <div className="activity-icon-container">
                    <UserPlus size={18} className="activity-icon confirmed" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <h4 className="activity-title">{item.name}</h4>
                      <span className={`registration-type-badge ${item.type}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="activity-message">{item.dateText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
