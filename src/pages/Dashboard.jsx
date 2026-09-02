import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAppointments, updateAppointmentStatus, getCurrentUser } from "../utils/storage";
import StatusBadge from "../components/StatusBadge";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ClipboardList,
  UserCheck
} from "lucide-react";
import "../pages/AdminShared.css";
import "../pages/AdminDashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const loadDoctorData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const allAppts = getAppointments();
      let myAppts = allAppts.filter(
        (a) =>
          a.doctorId === user.refId ||
          a.doctorId === user.id ||
          (a.doctorName && String(a.doctorName).toLowerCase().includes(String(user.name || "").toLowerCase()))
      );

      // Auto-inject demo appointments for new doctors so the dashboard isn't completely empty for testing
      if (myAppts.length === 0) {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const localToday = `${yyyy}-${mm}-${dd}`;

        const demoAppts = [
          {
            id: `APT-DEMO-1-${Date.now()}`,
            patientId: "P_1",
            patientName: "Raksha",
            patient: "Raksha",
            doctorId: user.refId || user.id || "DOC-101",
            doctorName: user.name || "Dr. Emily Carter",
            date: localToday,
            time: "10:30 AM",
            type: "General Checkup",
            status: "Upcoming"
          },
          {
            id: `APT-DEMO-2-${Date.now()}`,
            patientId: "P_2",
            patientName: "Amit Patel",
            patient: "Amit Patel",
            doctorId: user.refId || user.id || "DOC-101",
            doctorName: user.name || "Dr. Emily Carter",
            date: localToday,
            time: "02:00 PM",
            type: "Follow-up Consultation",
            status: "Pending"
          }
        ];

        const updatedAppts = [...allAppts, ...demoAppts];
        localStorage.setItem("medibook_appointments", JSON.stringify(updatedAppts));
        myAppts = demoAppts;
        window.dispatchEvent(new Event("medibook_appointments_updated"));
      }

      setAppointments(myAppts);
    }
  };

  useEffect(() => {
    loadDoctorData();
    const handleUpdate = () => loadDoctorData();
    window.addEventListener("medibook_appointments_updated", handleUpdate);
    return () => {
      window.removeEventListener("medibook_appointments_updated", handleUpdate);
    };
  }, []);

  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const todaysAppointments = appointments.filter(
    (a) => a.date === todayStr || String(a.date).toLowerCase().includes("today")
  );
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "Upcoming" || a.status === "Confirmed"
  );
  const completedAppointments = appointments.filter((a) => a.status === "Completed");
  const pendingAppointments = appointments.filter((a) => a.status === "Pending");

  const handleStatusChange = (id, newStatus) => {
    updateAppointmentStatus(id, newStatus);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // Format doctor name cleanly
  const rawName = currentUser?.name || "Emily Carter";
  const doctorDisplayName = rawName.toLowerCase().startsWith("dr.") ? rawName : `Dr. ${rawName}`;

  return (
    <main className="patient-dashboard-content">
      {/* 1. Header / Page Introduction */}
      <section className="greeting-section">
        <h2 className="greeting-title">Welcome back, {doctorDisplayName}!</h2>
        <p className="greeting-subtitle">Here is an overview of your schedule and patients.</p>
      </section>

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
    </main>
  );
}

export default Dashboard;