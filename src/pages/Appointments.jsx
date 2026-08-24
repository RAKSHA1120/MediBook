import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import appointments from "../data/patientAppointments";
import "./Appointments.css";

function Appointments() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Upcoming");
    const [appointmentsData, setAppointmentsData] = useState(() => {
        try {
            const stored = localStorage.getItem("medibook_appointments");
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return appointments;
    });

    const handleCancel = (id) => {
        if(window.confirm("Are you sure you want to cancel this appointment?")) {
            const updated = appointmentsData.map(a => a.id === id ? { ...a, status: "Cancelled" } : a);
            setAppointmentsData(updated);
            try {
                const storedStr = localStorage.getItem("medibook_appointments");
                if (storedStr) {
                    const stored = JSON.parse(storedStr);
                    const newStored = stored.map(a => a.id === id ? { ...a, status: "Cancelled" } : a);
                    localStorage.setItem("medibook_appointments", JSON.stringify(newStored));
                }
            } catch(e) {}
        }
    };

    const handleEdit = (appointment) => {
        const dummyDoc = {
            id: "d" + Math.floor(Math.random()*100),
            name: appointment.doctorName,
            specialty: appointment.specialty,
            hospital: "Apollo Hospital",
            consultationFee: 600,
            rating: "4.8",
            reviewCount: 120
        };
        const updated = appointmentsData.map(a => a.id === appointment.id ? { ...a, status: "Cancelled" } : a);
        setAppointmentsData(updated);
        try {
            const storedStr = localStorage.getItem("medibook_appointments");
            if (storedStr) {
                const stored = JSON.parse(storedStr);
                const newStored = stored.map(a => a.id === appointment.id ? { ...a, status: "Cancelled" } : a);
                localStorage.setItem("medibook_appointments", JSON.stringify(newStored));
            }
        } catch(e) {}
        navigate("/book-appointment", { state: { doctor: dummyDoc } });
    };

    const tabs = [
        { id: "Upcoming", label: "Upcoming", count: appointmentsData.filter(a => a.status === "Upcoming").length, color: "blue" },
        { id: "Completed", label: "Completed", count: appointmentsData.filter(a => a.status === "Completed").length, color: "green" },
        { id: "Cancelled", label: "Cancelled", count: appointmentsData.filter(a => a.status === "Cancelled").length, color: "red" }
    ];

    const filteredAppointments = appointmentsData.filter(a => a.status === activeTab);

    return (
        <div className="appointments-page">
            <div className="page-header">
                <h1 className="page-title">My Appointments</h1>
                <p className="page-subtitle">View and manage all your appointments</p>
            </div>

            <div className="appointment-tabs">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        <span className={`tab-badge ${tab.color}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            <h2 className="section-title">{activeTab} Appointments</h2>

            <div className="appointments-list">
                {filteredAppointments.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No {activeTab.toLowerCase()} appointments found.</p>
                ) : (
                    filteredAppointments.map(appointment => (
                        <div className="appointment-card" key={appointment.id}>
                            
                            {/* Left Section: Doctor Info */}
                            <div className="card-section left">
                                <img src={`https://i.pravatar.cc/150?u=${appointment.doctorName}`} alt={appointment.doctorName} className="doc-img" />
                                <div className="doc-info">
                                    <h3>{appointment.doctorName}</h3>
                                    <p className="doc-spec">{appointment.specialty}</p>
                                    <div className="doc-rating">
                                        ⭐ 4.8 (120 Reviews)
                                    </div>
                                    <div className="doc-hospital">
                                        🏥 Apollo Hospital, Chennai
                                    </div>
                                </div>
                            </div>

                            {/* Middle Section: Details */}
                            <div className="card-section middle">
                                <div className="details-col">
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <div className="detail-text">
                                            <span className="detail-label">Date</span>
                                            <span className="detail-val">{appointment.date}</span>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🕒</span>
                                        <div className="detail-text">
                                            <span className="detail-label">Time</span>
                                            <span className="detail-val">{appointment.time}</span>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">💵</span>
                                        <div className="detail-text">
                                            <span className="detail-label">Fee</span>
                                            <span className="detail-val">₹600.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Actions */}
                            <div className="card-section right">
                                <span className={`status-badge ${appointment.status.toLowerCase() === 'upcoming' ? 'confirmed' : appointment.status.toLowerCase()}`}>
                                    {appointment.status === 'Upcoming' ? 'Confirmed' : appointment.status}
                                </span>
                                
                                <div className="app-id">
                                    Appointment ID
                                    <span>{appointment.id || `MBK250524000${Math.floor(Math.random()*100)}`}</span>
                                </div>

                                <div className="action-buttons">
                                    <button 
                                        className="action-btn view"
                                        onClick={() => navigate(`/appointments/${appointment.id}`)}
                                    >
                                        👁️ View
                                    </button>
                                    {appointment.status === "Upcoming" && (
                                        <>
                                            <button className="action-btn view" style={{borderColor: "var(--primary)", color: "var(--primary)"}} onClick={() => handleEdit(appointment)}>
                                                ✏️ Edit
                                            </button>
                                            <button className="action-btn cancel" onClick={() => handleCancel(appointment.id)}>
                                                ❌ Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Appointments;