import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";

function AdminHelpSupport() {
  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="Help & Support" 
        subtitle="Get assistance with system administration"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)", marginTop: "var(--spacing-lg)" }}>
        <Card>
           <h3>Contact Technical Support</h3>
           <p className="text-gray mt-sm mb-md">Our enterprise support team is available 24/7 for critical system issues.</p>
           <p><strong>Email:</strong> admin-support@medibook.com</p>
           <p><strong>Phone:</strong> 1-800-MED-SYS1</p>
           <Button variant="primary" style={{ marginTop: "var(--spacing-md)" }}>Open Support Ticket</Button>
        </Card>

        <Card>
           <h3>Administrator FAQ</h3>
           <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", marginTop: "var(--spacing-md)" }}>
             <div>
               <strong>How do I onboard a new doctor?</strong>
               <p className="text-gray text-sm mt-xs">Navigate to the Doctors section and click 'Add New Doctor'. An ID and Password will be automatically generated.</p>
             </div>
             <div>
               <strong>How can I reset a user's password?</strong>
               <p className="text-gray text-sm mt-xs">Go to their profile in the management views and select 'Reset Credentials' in the actions menu.</p>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminHelpSupport;
