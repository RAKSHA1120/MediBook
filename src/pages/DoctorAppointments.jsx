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

    useEffect(() => {
        loadAppointments();
        window.addEventListener("medibook_appointments_updated", loadAppointments);
        return () => window.removeEventListener("medibook_appointments_updated", loadAppointments);
    }, []);

    const loadAppointments = () => {
        const user = getCurrentUser();
        if (user) {
            const allAppts = getAppointments();
            const myAppts = allAppts.filter(a => a.doctorId === user.refId || a.doctorId === user.id || a.doctorName?.includes(user.name));
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
        const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const openDetails = (apt) => {
        // Fetch patient details to get contact info
        const allPatients = getPatients();
        const patientInfo = allPatients.find(p => p.id === apt.patientId || p.name === apt.patientName || p.name === apt.patient);
        
        setSelectedAppointment({
            ...apt,
            contact: patientInfo?.contact || patientInfo?.phone || "N/A",
            email: patientInfo?.email || "N/A",
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
                            <span className="detail-value">{selectedAppointment.patientName || selectedAppointment.patient}</span>
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
                            <span className="detail-value">{selectedAppointment.type}</span>
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
                                            handleStatusChange(selectedAppointment.id, 'Completed');
                                            setIsDetailsModalOpen(false);
                                        }}>Complete</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </main>
    );
}

export default DoctorAppointments;
