import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";

function AdminSettings() {
  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure application preferences and security"
      />

      <Card style={{ marginTop: "var(--spacing-lg)" }}>
         <h3>Account Settings</h3>
         <p className="text-gray mb-md">Manage your account credentials.</p>
         <Button variant="outline">Change Password</Button>

         <hr style={{ margin: "var(--spacing-lg) 0", border: "0", borderTop: "1px solid var(--border-color)" }} />

         <h3>Notification Preferences</h3>
         <p className="text-gray mb-md">Configure how you receive system alerts.</p>
         <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
           <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             <input type="checkbox" defaultChecked /> Email Notifications
           </label>
           <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
             <input type="checkbox" defaultChecked /> In-App Alerts
           </label>
         </div>

         <hr style={{ margin: "var(--spacing-lg) 0", border: "0", borderTop: "1px solid var(--border-color)" }} />

         <h3>Security Settings</h3>
         <p className="text-gray mb-md">Manage system security and session controls.</p>
         <Button variant="outline">View Active Sessions</Button>
      </Card>
    </div>
  );
}

export default AdminSettings;
