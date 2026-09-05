import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";

import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";

function DoctorPatientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const user = getCurrentUser();
                const doc = getCurrentDoctor();
                const doctorId = user?.doctorId || doc?.id || user?.id;

                // Load all appointments for this doctor then filter by patient
                const res = await fetch(`http://localhost:5107/api/Appointments/doctor/${doctorId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const appts = Array.isArray(data) ? data : [];

                // Find the patient by ID from their appointments
                const patientAppts = appts.filter(a =>
                    String(a.patientId) === String(id) ||
                    a.patientName?.toLowerCase().replace(/\s+/g, "") === String(id).toLowerCase()
                );

                if (patientAppts.length > 0) {
                    const first = patientAppts[0];
                    setPatient({
                        id: first.patientId || id,
                        name: first.patientName || "Patient",
                        age: "N/A",
                        gender: "N/A",
                        contact: "N/A",
                        email: "N/A",
                        bloodGroup: "N/A",
                        status: "Active",
                        notes: ""
                    });

                    const normalized = patientAppts.map(a => ({
                        id: a.id,
                        date: a.appointmentDate ? String(a.appointmentDate).split("T")[0] : "",
                        time: a.appointmentTime || "",
                        type: a.reason || a.appointmentType || "Consultation",
                        status: a.status || "Pending"
                    }));
                    normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setHistory(normalized);
                } else {
                    // Patient ID not found in appointments
                    setPatient(null);
                }
            } catch (err) {
                console.error("Failed to load patient details:", err);
                setError("Unable to load patient details. Please check the backend connection.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <main className="patient-dashboard-content">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "60px 20px" }}>
                    <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
                    <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>Loading patient details...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="patient-dashboard-content">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "40px 20px", color: "var(--error)" }}>
                    <AlertCircle size={24} />
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    if (!patient) {
        return (
            <main className="patient-dashboard-content">
                <div style={{ padding: "40px 20px" }}>
                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <p style={{ marginTop: "24px", color: "var(--text-muted)" }}>Patient not found.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="patient-dashboard-content">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} />
                </Button>
                <PageHeader title="Patient Details" style={{ margin: 0 }} />
            </div>

            <div className="dashboard-main-info-grid">
                {/* Left Column: Demographics */}
                <div className="next-appointment-column">
                    <Card>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <User size={32} color="#0284c7" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", margin: "0 0 4px 0", color: "#0f172a" }}>{patient.name}</h3>
                                <p style={{ margin: 0, color: "#64748b" }}>ID: {patient.id}</p>
                            </div>
                        </div>

                        <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontWeight: 500 }}>Age / Gender</span>
                            <span style={{ color: "#0f172a", fontWeight: 500 }}>{patient.age} / {patient.gender}</span>
                        </div>
                        <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontWeight: 500 }}>Phone</span>
                            <span style={{ color: "#0f172a", fontWeight: 500 }}>{patient.contact || patient.phone || "N/A"}</span>
                        </div>
                        <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontWeight: 500 }}>Email</span>
                            <span style={{ color: "#0f172a", fontWeight: 500 }}>{patient.email || "N/A"}</span>
                        </div>
                        <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
                            <span style={{ color: "#64748b", fontWeight: 500 }}>Blood Group</span>
                            <span style={{ color: "#0f172a", fontWeight: 500 }}>{patient.bloodGroup || "N/A"}</span>
                        </div>
                        <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                            <span style={{ color: "#64748b", fontWeight: 500 }}>Status</span>
                            <span><StatusBadge status={patient.status || "Active"} /></span>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Appointment History */}
                <div className="quick-actions-column">
                    <Card>
                        <h4 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                            <CalendarDays size={20} color="#0284c7" />
                            Consultation History
                        </h4>

                        {history.length === 0 ? (
                            <p className="text-gray">No previous appointments found with this patient.</p>
                        ) : (
                            <div className="recent-activity-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {history.map(apt => (
                                    <div key={apt.id} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                            <div>
                                                <h5 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "1rem" }}>{apt.date} at {apt.time}</h5>
                                                <span style={{ color: "#64748b", fontSize: "0.875rem" }}>{apt.type}</span>
                                            </div>
                                            <StatusBadge status={apt.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </main>
    );
}

export default DoctorPatientDetails;
