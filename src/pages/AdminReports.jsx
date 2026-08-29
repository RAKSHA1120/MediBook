import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { adminStats } from "../data/adminMockData";
// Reuse global layout

function AdminReports() {
  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="System-wide statistics and performance reports"
      >
        <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="sm">This Week</Button>
            <Button variant="primary" size="sm">This Month</Button>
        </div>
      </PageHeader>

      <section className="benefits-section" style={{ marginTop: "0" }}>
        <div className="benefit-card">
          <h4 className="benefit-title">{adminStats.totalAppointments}</h4>
          <p className="benefit-description">Total Appointments</p>
        </div>
        <div className="benefit-card">
          <h4 className="benefit-title">{adminStats.completedAppointments}</h4>
          <p className="benefit-description">Completed</p>
        </div>
        <div className="benefit-card">
          <h4 className="benefit-title">{adminStats.cancelledAppointments}</h4>
          <p className="benefit-description">Cancelled</p>
        </div>
      </section>

      <section className="dashboard-main-info-grid">
         <div className="quick-actions-card" style={{minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <h3 className="section-main-title">Monthly Appointment Trends</h3>
            <p className="text-gray text-center mt-md">Chart visualization placeholder.<br/>(Connect a charting library here)</p>
         </div>
         <div className="quick-actions-card" style={{minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <h3 className="section-main-title">Patient Demographics</h3>
            <p className="text-gray text-center mt-md">Chart visualization placeholder.<br/>(Connect a charting library here)</p>
         </div>
      </section>
    </div>
  );
}

export default AdminReports;
