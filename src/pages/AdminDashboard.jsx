import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Users, CalendarCheck, Stethoscope, BriefcaseMedical, CheckCircle2, UserPlus, ClipboardList } from "lucide-react";
import { getDoctors, getPatients, getAppointments } from "../utils/storage";
import Button from "../components/Button";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAppointments: 0, todayAppointments: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);

  useEffect(() => {
    const docs = getDoctors();
    const pats = getPatients();
    const appts = getAppointments();

    const todayStr = new Date().toISOString().split("T")[0];

    setStats({
      totalDoctors: docs.length,
      totalPatients: pats.length,
      totalAppointments: appts.length,
      todayAppointments: appts.filter(a => a.date === todayStr || String(a.date).toLowerCase().includes("today")).length
    });

    setRecentAppointments(appts.slice(-4).reverse());
    setRecentDoctors(docs.slice(-4).reverse());
  }, []);

  return (
    <main className="patient-dashboard-content">
      {/* Greeting Section (Matches PatientDashboard) */}
      <section className="greeting-section">
        <h2 className="greeting-title">Welcome back, System Admin!</h2>
        <p className="greeting-subtitle">
          Here is an overview of MediBook's system status today.
        </p>
      </section>

      {/* Statistics Cards (Uses benefits-section structure) */}
      <section className="benefits-section" style={{ marginTop: "0" }}>
        <div className="benefit-card">
          <div className="benefit-icon-wrapper">
            <Stethoscope size={24} />
          </div>
          <h4 className="benefit-title">{stats.totalDoctors}</h4>
          <p className="benefit-description">Total Doctors</p>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon-wrapper">
            <Users size={24} />
          </div>
          <h4 className="benefit-title">{stats.totalPatients}</h4>
          <p className="benefit-description">Total Patients</p>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon-wrapper">
            <CalendarCheck size={24} />
          </div>
          <h4 className="benefit-title">{stats.todayAppointments}</h4>
          <p className="benefit-description">Today's Appointments</p>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon-wrapper">
            <BriefcaseMedical size={24} />
          </div>
          <h4 className="benefit-title">{stats.totalAppointments}</h4>
          <p className="benefit-description">Total Appointments</p>
        </div>
      </section>

      {/* Main Grid for Recent Items */}
      <section className="dashboard-main-info-grid">
        
        {/* Left Column: Recent Appointments (using recent-activity-card style) */}
        <div className="next-appointment-column">
          <div className="section-header">
            <h3 className="section-main-title">Recent Appointments</h3>
            <button className="view-all-link" onClick={() => navigate("/admin/appointments")}>
              View All
            </button>
          </div>

          <div className="recent-activity-card">
            <div className="recent-activity-list">
              {recentAppointments.length === 0 ? <p className="text-gray" style={{padding: '16px'}}>No recent appointments</p> : null}
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="activity-item" onClick={() => navigate(`/admin/appointments/${apt.id}`)}>
                  <div className="activity-icon-container">
                     <ClipboardList size={18} className="activity-icon reminder" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <h4 className="activity-title">{apt.patientName} &bull; {apt.doctorName}</h4>
                      <span className="activity-time">{apt.status}</span>
                    </div>
                    <p className="activity-message">{apt.type} on {apt.date} at {apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Doctor Registrations (using recent-activity-card style) */}
        <div className="quick-actions-column">
          <div className="section-header">
            <h3 className="section-main-title">New Registrations</h3>
            <button className="view-all-link" onClick={() => navigate("/admin/doctors")}>
              View All
            </button>
          </div>
          
          <div className="recent-activity-card">
            <div className="recent-activity-list">
              {recentDoctors.length === 0 ? <p className="text-gray" style={{padding: '16px'}}>No recent doctors</p> : null}
              {recentDoctors.map((doc) => (
                 <div key={doc.id} className="activity-item" onClick={() => navigate("/admin/doctors")}>
                  <div className="activity-icon-container">
                     <UserPlus size={18} className="activity-icon confirmed" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title-row">
                      <h4 className="activity-title">{doc.name}</h4>
                      <span className="activity-time">{doc.status}</span>
                    </div>
                    <p className="activity-message">{doc.specialization} &bull; {doc.hospital}</p>
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
