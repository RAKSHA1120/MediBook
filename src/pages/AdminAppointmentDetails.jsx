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
        actionLabel="Back to List"
        onAction={() => navigate("/admin/appointments")}
      />

      <Card style={{ marginTop: "24px", padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--text-heading)", marginBottom: "8px" }}>Booking Information</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Manage the status of this appointment.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <StatusBadge status={appointment.status} />
            <select 
                className="field-select"
                style={{ padding: '8px 12px', minWidth: '140px', fontSize: '14px' }}
                value={appointment.status}
                onChange={(e) => {
                   updateAppointmentStatus(appointment.id, e.target.value);
                   setAppointment({...appointment, status: e.target.value});
                }}
            >
                <option value="Upcoming">Upcoming</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
          {/* Patient Info */}
          <div style={{ background: "var(--background)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <h4 style={{ color: "var(--primary)", marginBottom: "16px", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              Patient Information
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Name</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appointment.patientName || appointment.patient}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Patient ID</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appointment.patientId || "N/A"}</span>
                </div>
            </div>
          </div>

          {/* Doctor Info */}
          <div style={{ background: "var(--background)", padding: "20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <h4 style={{ color: "var(--primary)", marginBottom: "16px", fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              Doctor Information
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Name</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appointment.doctorName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Specialization</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appointment.specialty || appointment.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Doctor ID</span>
                    <span style={{ fontWeight: "500", color: "var(--text-primary)" }}>{appointment.doctorId || "N/A"}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Appointment Specifics */}
        <div style={{ marginTop: "32px", background: "var(--background)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
           <h4 style={{ color: "var(--text-heading)", marginBottom: "20px", fontSize: "16px", fontWeight: "600" }}>Appointment Specifics</h4>
           
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
               <div>
                   <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date</span>
                   <span style={{ fontWeight: "500", fontSize: "15px", color: "var(--text-primary)" }}>{appointment.date}</span>
               </div>
               <div>
                   <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Time</span>
                   <span style={{ fontWeight: "500", fontSize: "15px", color: "var(--text-primary)" }}>{appointment.time}</span>
               </div>
               <div>
                   <span style={{ display: "block", color: "var(--text-muted)", fontSize: "13px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Consultation Type</span>
                   <span style={{ fontWeight: "500", fontSize: "15px", color: "var(--text-primary)" }}>{appointment.type || "Consultation"}</span>
               </div>
           </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminAppointmentDetails;
