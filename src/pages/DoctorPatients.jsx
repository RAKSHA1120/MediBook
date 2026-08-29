import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAppointments, getCurrentUser, getPatients } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import "../pages/AdminShared.css";

function DoctorPatients() {
    const [doctorPatients, setDoctorPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            const allAppts = getAppointments();
            const myAppts = allAppts.filter(a => a.doctorId === user.refId || a.doctorId === user.id || a.doctorName?.includes(user.name));
            
            // Extract unique patients based on appointments
            const uniquePatientIds = [...new Set(myAppts.map(a => a.patientId))].filter(Boolean);
            
            const allPatients = getPatients();
            // In case patientId isn't fully robust in mock data, also use patient names
            const uniquePatientNames = [...new Set(myAppts.map(a => a.patientName || a.patient))].filter(Boolean);

            const filteredPatients = allPatients.filter(p => 
                uniquePatientIds.includes(p.id) || uniquePatientNames.includes(p.name)
            );
            
            setDoctorPatients(filteredPatients);
        }
    }, []);

    const filtered = doctorPatients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.contact?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="patient-dashboard-content">
            <PageHeader title="My Patients" subtitle="Patients you have consulted or have upcoming appointments with." />

            <div className="filters-row" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div className="search-bar" style={{ flex: 1, position: "relative", maxWidth: "400px" }}>
                    <Search className="search-icon" size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#666" }} />
                    <input 
                        type="text" 
                        placeholder="Search by patient name or phone..." 
                        className="field-input"
                        style={{ paddingLeft: "36px" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-card">
                {filtered.length === 0 ? (
                    <p className="text-gray" style={{ padding: '24px', textAlign: 'center' }}>No patients found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Age/Gender</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((pt) => (
                                    <tr key={pt.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar">{(pt.name || "P").charAt(0)}</div>
                                                <div className="user-details">
                                                    <span className="user-name">{pt.name}</span>
                                                    <span className="user-subtext">ID: {pt.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="nowrap">{pt.age} / {pt.gender}</td>
                                        <td className="nowrap">{pt.contact || pt.phone || 'N/A'}</td>
                                        <td>
                                            <span className={`status ${pt.status === 'Active' ? 'status-completed' : 'status-cancelled'}`}>
                                                {pt.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/doctor/patients/${pt.id}`)}>
                                                <Eye size={14} style={{ marginRight: '4px' }} /> View History
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}

export default DoctorPatients;
