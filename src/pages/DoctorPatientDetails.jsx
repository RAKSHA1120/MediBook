import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, CalendarDays } from "lucide-react";
import { getPatients, getAppointments, getCurrentUser } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";

function DoctorPatientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const allPatients = getPatients();
        const foundPatient = allPatients.find(p => p.id === id);
        setPatient(foundPatient);

        if (foundPatient) {
            const user = getCurrentUser();
            const allAppts = getAppointments();
            
            // Filter all appointments this patient had with this specific doctor
            const patientAppts = allAppts.filter(a => 
                (a.patientId === foundPatient.id || a.patientName === foundPatient.name || a.patient === foundPatient.name) &&
                (a.doctorId === user.refId || a.doctorId === user.id || a.doctorName?.includes(user.name))
            );
            
            // Sort by date (descending, simple sort)
            patientAppts.sort((a, b) => new Date(b.date) - new Date(a.date));
            setHistory(patientAppts);
        }
    }, [id]);

    if (!patient) return <div className="patient-dashboard-content">Loading...</div>;

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

                    <Card style={{ marginTop: "24px" }}>
                        <h4 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.1rem" }}>Medical Notes (Demo)</h4>
                        <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                            {patient.notes || "No general medical notes available for this patient yet. This section can be used to store persistent medical history, allergies, and ongoing treatments."}
                        </p>
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
                                        {apt.status === "Completed" && (
                                            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #cbd5e1" }}>
                                                <span style={{ display: "block", color: "#64748b", fontSize: "0.875rem", marginBottom: "4px" }}>Doctor's Notes (Demo):</span>
                                                <p style={{ margin: 0, color: "#334155", fontSize: "0.9rem" }}>
                                                    Patient presented with standard symptoms related to {apt.type}. Advised rest and prescribed standard medication. Follow up if symptoms persist.
                                                </p>
                                            </div>
                                        )}
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
