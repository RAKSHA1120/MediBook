import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAppointments, updateAppointmentStatus, getCurrentUser } from "../utils/storage";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { Users, CalendarCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import "../pages/AdminShared.css";

function Dashboard() {
    const [appointments, setAppointments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadAppointments = () => {
            const user = getCurrentUser();
            setCurrentUser(user);
            if (user) {
                const allAppts = getAppointments();
                let myAppts = allAppts.filter(a => 
                    (a.doctorId === user.refId || a.doctorId === user.id || a.doctorName?.includes(user.name))
                    && (a.patientName || a.patientId)
                );
                setAppointments(myAppts);
            }
        };

        loadAppointments();
        window.addEventListener("medibook_appointments_updated", loadAppointments);
        return () => window.removeEventListener("medibook_appointments_updated", loadAppointments);
    }, []);

    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const todaysAppointments = appointments.filter(a => a.date === todayStr || String(a.date).toLowerCase().includes("today"));
    const upcomingCount = appointments.filter(a => a.status === "Upcoming").length;
    const completedCount = appointments.filter(a => a.status === "Completed").length;
    const pendingCount = appointments.filter(a => a.status === "Pending").length;

    const handleStatusChange = (id, newStatus) => {
        updateAppointmentStatus(id, newStatus);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    };

    return (
        <main className="patient-dashboard-content">
            <section className="greeting-section">
                <h2 className="greeting-title">
                    Welcome back, Dr. {currentUser?.name?.replace(/^(dr\.|dr\s)/i, '') || "Doctor"}!
                </h2>
                <p className="greeting-subtitle">Here is an overview of your schedule and patients.</p>
            </section>

            <section className="benefits-section" style={{ marginTop: "0" }}>
                <div className="benefit-card">
                    <div className="benefit-icon-wrapper">
                        <CalendarCheck size={24} />
                    </div>
                    <h4 className="benefit-title">{todaysAppointments.length}</h4>
                    <p className="benefit-description">Today's Appointments</p>
                </div>
                <div className="benefit-card">
                    <div className="benefit-icon-wrapper">
                        <Clock size={24} />
                    </div>
                    <h4 className="benefit-title">{upcomingCount}</h4>
                    <p className="benefit-description">Upcoming Appointments</p>
                </div>
                <div className="benefit-card">
                    <div className="benefit-icon-wrapper">
                        <CheckCircle2 size={24} />
                    </div>
                    <h4 className="benefit-title">{completedCount}</h4>
                    <p className="benefit-description">Completed Appointments</p>
                </div>
                <div className="benefit-card">
                    <div className="benefit-icon-wrapper">
                        <AlertCircle size={24} />
                    </div>
                    <h4 className="benefit-title">{pendingCount}</h4>
                    <p className="benefit-description">Pending Appointments</p>
                </div>
            </section>

            <section className="dashboard-main-info-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="next-appointment-column">
                    <div className="section-header">
                        <h3 className="section-main-title">Today's Appointments</h3>
                        <Link to="/doctor/appointments" className="view-all-link">View All</Link>
                    </div>
                    <div className="admin-table-card">
                        {todaysAppointments.length === 0 ? (
                            <p className="text-gray" style={{ padding: '24px', textAlign: 'center' }}>No appointments scheduled for today.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Time</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todaysAppointments.map((apt) => (
                                            <tr key={apt.id}>
                                                <td>
                                                    <div className="user-info-cell">
                                                        <div className="user-avatar">{(apt.patientName || apt.patient || "P").charAt(0)}</div>
                                                        <div className="user-details">
                                                            <span className="user-name">{apt.patientName || apt.patient}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="nowrap">{apt.time}</td>
                                                <td>{apt.type}</td>
                                                <td className="nowrap"><StatusBadge status={apt.status} /></td>
                                                <td>
                                                    <select 
                                                        className="field-select" 
                                                        value={apt.status} 
                                                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                                                        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', minWidth: '110px', fontSize: '13px' }}
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
        </main>
    );
}

export default Dashboard;