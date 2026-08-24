import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import appointments from "../data/patientAppointments";
import "./AppointmentDetails.css";
import "./Appointments.css"; // Reuse some styles for doctor card

function AppointmentDetails() {
    const { id } = useParams();
    const [appointmentsData, setAppointmentsData] = useState(() => {
        try {
            const stored = localStorage.getItem("medibook_appointments");
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return appointments;
    });
    const navigate = useNavigate();

    // Just use the first appointment if id is not found for preview purposes, or show error
    const appointment = appointmentsData.find(item => item.id === id) || appointmentsData[0];

    const handleCancel = () => {
        if(window.confirm("Are you sure you want to cancel this appointment?")) {
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
        }
    };
    
    const handleEdit = () => {
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

    if (!appointment) {
        return (
            <div className="details-page" style={{ textAlign: "center" }}>
                <h2>Appointment not found</h2>
                <button onClick={() => navigate(-1)} className="action-btn view" style={{ marginTop: "16px" }}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="details-page">
            <button onClick={() => navigate(-1)} className="back-link">
                ← Back to My Appointments
            </button>

            <div className="details-header">
                <div className="details-header-text">
                    <h1>Appointment Details</h1>
                    <p>View your appointment information</p>
                </div>
                <div className="details-status">
                    <span className={`status-badge ${appointment.status.toLowerCase() === 'upcoming' ? 'confirmed' : appointment.status.toLowerCase()}`}>
                        {appointment.status === 'Upcoming' ? 'Confirmed' : appointment.status}
                    </span>
                    <div className="app-id" style={{ textAlign: 'right', margin: 0 }}>
                        Appointment ID
                        <span style={{ fontSize: '14px' }}>{appointment.id || `MBK250524000123`}</span>
                    </div>
                </div>
            </div>

            {/* Doctor Card (Reused from Appointments list) */}
            <div className="appointment-card" style={{ marginBottom: "24px" }}>
                <div className="card-section left" style={{ flex: 1.5 }}>
                    <img src={`https://i.pravatar.cc/150?u=${appointment.doctorName}`} alt={appointment.doctorName} className="doc-img" />
                    <div className="doc-info">
                        <h3>{appointment.doctorName}</h3>
                        <p className="doc-spec">{appointment.specialty}</p>
                        <div className="doc-hospital" style={{ marginTop: '8px' }}>
                            🏥 Apollo Hospital, Chennai
                        </div>
                    </div>
                </div>
                <div className="card-section middle" style={{ flex: 1, borderLeft: "none", paddingLeft: 0, justifyContent: "flex-end" }}>
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
            </div>

            {/* Appointment Information */}
            <div className="info-section">
                <div className="info-section-title">
                    📋 Appointment Information
                </div>
                <div className="info-grid">
                    <div className="info-row">
                        <span className="info-label">Appointment ID</span>
                        <span className="info-value">{appointment.id || `MBK250524000123`}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Booking Date & Time</span>
                        <span className="info-value">20 May 2025, 08:45 PM</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Consultation Type</span>
                        <span className="info-value">In-Person Visit</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Patient Name</span>
                        <span className="info-value">Priya Sharma</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Patient Mobile</span>
                        <span className="info-value">+91 98765 43210</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Patient Email</span>
                        <span className="info-value">priyasharma@email.com</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Payment Status</span>
                        <span className="info-value paid">Paid</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Payment Method</span>
                        <span className="info-value">UPI</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Total Amount</span>
                        <span className="info-value">₹600.00</span>
                    </div>
                </div>
            </div>

            {/* Hospital Information */}
            <div className="info-section">
                <div className="info-section-title">
                    🏥 Hospital Information
                </div>
                <div className="hospital-content">
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Hospital" className="hospital-img" />
                    <div className="hospital-details">
                        <h3>Apollo Hospital</h3>
                        <p>21, Greams Lane,<br/>Off Greams Road,<br/>Chennai - 600006<br/>Tamil Nadu, India</p>
                        <div className="hospital-location">
                            📍 4.2 km from your location
                        </div>
                    </div>
                    <div className="hospital-contact">
                        <div className="contact-item">
                            📞 044 2829 0200
                        </div>
                        <div className="contact-item">
                            ✉️ enquiry@apollohospitals.com
                        </div>
                        <div className="contact-item">
                            🌐 www.apollohospitals.com
                        </div>
                        <div className="contact-item open">
                            🕒 Open 24 Hours
                        </div>
                    </div>
                </div>
            </div>

            {/* Important Notes */}
            <div className="notes-section">
                <div className="notes-title">
                    ℹ️ Important Notes
                </div>
                <ul className="notes-list">
                    <li>Please arrive 15 minutes early for your appointment.</li>
                    <li>Carry a valid ID proof and previous medical records, if any.</li>
                    <li>In case you are unable to attend, please cancel or reschedule in advance.</li>
                </ul>
            </div>

            {/* Actions */}
            {appointment.status === "Upcoming" && (
                <div className="actions-section">
                    <h3>What would you like to do?</h3>
                    <div className="actions-grid">
                        <button className="action-card-btn reschedule" onClick={handleEdit}>
                            <span>📅 Reschedule Appointment</span>
                            <small>Choose a new date and time</small>
                        </button>
                        <button className="action-card-btn cancel-full" onClick={handleCancel}>
                            <span>❌ Cancel Appointment</span>
                            <small>Cancel this appointment</small>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AppointmentDetails;