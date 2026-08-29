import { useState, useEffect } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { getAppointments, updateAppointmentStatus, getCurrentUser } from "../utils/storage";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { getPatients } from "../utils/storage";
import "../pages/AdminShared.css";

function DoctorAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [consultationNotes, setConsultationNotes] = useState("");
    const [prescribedMedicines, setPrescribedMedicines] = useState("");

    useEffect(() => {
        loadAppointments();
        window.addEventListener("medibook_appointments_updated", loadAppointments);
        return () => window.removeEventListener("medibook_appointments_updated", loadAppointments);
    }, []);

    const loadAppointments = () => {
        const user = getCurrentUser();
        if (user) {
            const allAppts = getAppointments();
            const myAppts = allAppts.filter(a => 
                (a.doctorId === user.refId || a.doctorId === user.id || a.doctorName?.includes(user.name)) 
                && (a.patientName || a.patientId)
            );
            setAppointments(myAppts);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        updateAppointmentStatus(id, newStatus);
        loadAppointments();
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = (apt.patientName || apt.patient || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (apt.type || "").toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;
        if (statusFilter !== "All") {
            const s = String(apt.status || "").toLowerCase();
            const norm = s === 'scheduled' || s === 'confirmed' ? 'upcoming' : s;
            matchesStatus = norm === statusFilter.toLowerCase();
        }
        return matchesSearch && matchesStatus;
    });

    const openDetails = (apt) => {
        // Fetch patient details to get contact info
        const allPatients = getPatients();
        const allUsers = JSON.parse(localStorage.getItem("medibook_users") || "[]");
        
        const patientInfo = allPatients.find(p => p.id === apt.patientId || p.name === apt.patientName || p.name === apt.patient);
        const patientUser = allUsers.find(u => u.refId === apt.patientId || (patientInfo && u.refId === patientInfo.id));
        
        let extraProfile = {};
        if (patientUser) {
            try {
                const extraStr = localStorage.getItem(`medibook_profile_${patientUser.id}`);
                if (extraStr) extraProfile = JSON.parse(extraStr);
            } catch (e) {}
        }
        
        setSelectedAppointment({
            ...apt,
            patientName: apt.patientName || apt.patient || patientInfo?.name || "Unknown Patient",
            contact: extraProfile.phone || patientInfo?.contact || patientInfo?.phone || "N/A",
            email: extraProfile.email || patientInfo?.email || "N/A",
            notes: apt.notes || "No additional notes provided."
        });
        setIsDetailsModalOpen(true);
    };

    return (
        <main className="patient-dashboard-content">
            <PageHeader title="My Appointments" subtitle="Manage your assigned patient appointments." />

            <div className="filters-row" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div className="search-bar" style={{ flex: 1, position: "relative" }}>
                    <Search className="search-icon" size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#666" }} />
                    <input 
                        type="text" 
                        placeholder="Search by patient name or reason..." 
                        className="field-input"
                        style={{ paddingLeft: "36px" }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-select" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Filter size={18} color="#666" />
                    <select 
                        className="field-select" 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-card" style={{ marginTop: "16px" }}>
                {filteredAppointments.length === 0 ? (
                    <p className="text-gray" style={{ padding: '24px', textAlign: 'center' }}>No appointments found matching your criteria.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar">{(apt.patientName || apt.patient || "P").charAt(0)}</div>
                                                <div className="user-details">
                                                    <span className="user-name">{apt.patientName || apt.patient}</span>
                                                    <span className="user-subtext">ID: {apt.patientId || "N/A"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="nowrap">{apt.date}</td>
                                        <td className="nowrap">{apt.time}</td>
                                        <td>{apt.type}</td>
                                        <td className="nowrap"><StatusBadge status={apt.status} /></td>
                                        <td className="nowrap">
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <Button variant="outline" size="sm" onClick={() => openDetails(apt)}>
                                                    <Eye size={14} style={{ marginRight: '4px' }} /> View
                                                </Button>
                                                {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                                                    <select 
                                                        className="field-select" 
                                                        value={apt.status} 
                                                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                                                        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', minWidth: '130px', fontSize: '13px' }}
                                                    >
                                                        <option value="Upcoming">Upcoming</option>
                                                        <option value="Confirmed">Confirmed</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                        <option value="Pending">Pending</option>
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Appointment Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Appointment Details"
            >
                {selectedAppointment && (
                    <div className="appointment-details-modal">
                        <div className="detail-row">
                            <span className="detail-label">Patient Name:</span>
                            <span className="detail-value">{selectedAppointment.patientName || selectedAppointment.patient || "Unknown Patient"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{selectedAppointment.date}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Time:</span>
                            <span className="detail-value">{selectedAppointment.time}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Reason/Type:</span>
                            <span className="detail-value">{selectedAppointment.type || "Consultation"}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value"><StatusBadge status={selectedAppointment.status} /></span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Contact:</span>
                            <span className="detail-value">{selectedAppointment.contact}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{selectedAppointment.email}</span>
                        </div>
                        <div className="detail-row" style={{ borderBottom: "none", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                            <span className="detail-label">Appointment Notes:</span>
                            <span className="detail-value" style={{ color: "#64748b", fontStyle: "italic", lineHeight: "1.5" }}>{selectedAppointment.notes}</span>
                        </div>
                        
                        <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                {selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed' && (
                                    <Button variant="outline" onClick={() => {
                                        handleStatusChange(selectedAppointment.id, 'Cancelled');
                                        setIsDetailsModalOpen(false);
                                    }}>Cancel Appointment</Button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
                                {selectedAppointment.status !== 'Completed' && selectedAppointment.status !== 'Cancelled' && (
                                    <>
                                        <Button variant="primary" onClick={() => {
                                            handleStatusChange(selectedAppointment.id, 'Confirmed');
                                            setIsDetailsModalOpen(false);
                                        }}>Confirm</Button>
                                        <Button variant="primary" onClick={() => {
                                            setIsDetailsModalOpen(false);
                                            setIsPrescriptionModalOpen(true);
                                        }}>Complete Consultation</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Prescription / Consultation Notes Modal */}
            <Modal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                title="Complete Consultation"
            >
                {selectedAppointment && (
                    <div className="prescription-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Add consultation notes and prescriptions for <strong>{selectedAppointment.patientName || selectedAppointment.patient}</strong>. This will be available in their medical records.
                        </p>
                        
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>Consultation Notes / Diagnosis</label>
                            <textarea 
                                className="field-input" 
                                rows="4" 
                                placeholder="E.g., Patient presented with mild fever and sore throat..."
                                value={consultationNotes}
                                onChange={(e) => setConsultationNotes(e.target.value)}
                                style={{ resize: 'vertical', minHeight: '100px' }}
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>Prescribed Medicines</label>
                            <textarea 
                                className="field-input" 
                                rows="3" 
                                placeholder="E.g., Paracetamol 500mg - 1-0-1 for 3 days"
                                value={prescribedMedicines}
                                onChange={(e) => setPrescribedMedicines(e.target.value)}
                                style={{ resize: 'vertical', minHeight: '80px' }}
                            />
                        </div>

                        <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => {
                                // Save prescription to storage
                                const prescriptions = JSON.parse(localStorage.getItem("medibook_prescriptions") || "[]");
                                prescriptions.push({
                                    id: Date.now(),
                                    appointmentId: selectedAppointment.id,
                                    patientId: selectedAppointment.patientId,
                                    doctorId: selectedAppointment.doctorId,
                                    date: selectedAppointment.date,
                                    notes: consultationNotes,
                                    medicines: prescribedMedicines
                                });
                                localStorage.setItem("medibook_prescriptions", JSON.stringify(prescriptions));
                                
                                handleStatusChange(selectedAppointment.id, 'Completed');
                                setIsPrescriptionModalOpen(false);
                                setConsultationNotes("");
                                setPrescribedMedicines("");
                            }}>Save & Complete</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </main>
    );
}

export default DoctorAppointments;
