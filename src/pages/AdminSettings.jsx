import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { Lock, Bell, Shield } from "lucide-react";

function AdminSettings() {
  return (
    <div className="patient-dashboard-content">
      <PageHeader 
        title="System Settings" 
        subtitle="Configure application preferences and security"
      />

      <div className="dashboard-main-info-grid">
        <div className="next-appointment-column">
          <Card>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={20} style={{ color: "var(--primary)" }} /> Account Settings
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Manage your administrator account credentials.</p>
            <Button variant="outline">Change Password</Button>
          </Card>

          <Card style={{ marginTop: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={20} style={{ color: "var(--primary)" }} /> Notification Preferences
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Configure how you receive system alerts and updates.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginLeft: "4px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-primary)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} /> 
                Email Notifications
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-primary)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} /> 
                In-App Alerts
              </label>
            </div>
          </Card>

          <Card style={{ marginTop: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--text-heading)", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} style={{ color: "var(--primary)" }} /> Security Settings
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Manage system security, active sessions, and access controls.</p>
            <Button variant="outline">View Active Sessions</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
