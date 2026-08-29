import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAppointments, updateAppointmentStatus } from "../utils/storage";

function AdminAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const all = getAppointments();
    const found = all.find(a => String(a.id) === String(id));
    setAppointment(found);
  }, [id]);

  if (!appointment) return <div style={{padding: '2rem'}}>Loading or Appointment not found...</div>;

  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title={`Appointment Details: ${id || "APT-001"}`}
        subtitle="Detailed read-only view for administrative purposes"
      >
        <Button variant="outline" onClick={() => navigate("/admin/appointments")}>Back to List</Button>
      </PageHeader>

      <Card style={{ marginTop: "var(--spacing-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-lg)" }}>
          <h3>Booking Information</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <StatusBadge status={appointment.status} />
            <select 
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={appointment.status}
                onChange={(e) => {
                   updateAppointmentStatus(appointment.id, e.target.value);
                   setAppointment({...appointment, status: e.target.value});
                }}
            >
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)" }}>
          <div>
            <h4 style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-xs)" }}>Patient Information</h4>
            <p><strong>Name:</strong> {appointment.patientName || appointment.patient}</p>
            <p><strong>ID:</strong> {appointment.patientId || "N/A"}</p>
          </div>
          <div>
            <h4 style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-xs)" }}>Doctor Information</h4>
            <p><strong>Name:</strong> {appointment.doctorName}</p>
            <p><strong>Specialization:</strong> {appointment.specialty || appointment.type}</p>
            <p><strong>ID:</strong> {appointment.doctorId || "N/A"}</p>
          </div>
        </div>

        <hr style={{ margin: "var(--spacing-lg) 0", border: "0", borderTop: "1px solid var(--border-color)" }} />

        <div>
           <h4 style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-xs)" }}>Appointment specifics</h4>
           <p><strong>Date:</strong> {appointment.date}</p>
           <p><strong>Time:</strong> {appointment.time}</p>
           <p><strong>Type:</strong> {appointment.type || "Consultation"}</p>
        </div>
      </Card>
    </div>
  );
}

export default AdminAppointmentDetails;
