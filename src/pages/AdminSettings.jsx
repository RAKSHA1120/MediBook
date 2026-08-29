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
            <h3 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Lock size={20} color="#0284c7" /> Account Settings
            </h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Manage your administrator account credentials.</p>
            <Button variant="outline">Change Password</Button>
          </Card>

          <Card style={{ marginTop: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={20} color="#0284c7" /> Notification Preferences
            </h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Configure how you receive system alerts and updates.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginLeft: "4px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#0284c7" }} /> 
                Email Notifications
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#0284c7" }} /> 
                In-App Alerts
              </label>
            </div>
          </Card>

          <Card style={{ marginTop: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#0f172a", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} color="#0284c7" /> Security Settings
            </h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Manage system security, active sessions, and access controls.</p>
            <Button variant="outline">View Active Sessions</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
