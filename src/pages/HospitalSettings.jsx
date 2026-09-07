import { useState } from "react";
import { Lock, LogOut, ShieldCheck, Bell, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearCurrentUser } from "../utils/auth";

import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import "./AdminShared.css";

function HospitalSettings() {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [notifications, setNotifications] = useState({
    appointmentAlerts: true,
    cancellationAlerts: true,
    weeklyReports: false
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const user = getCurrentUser();
    if (!user) return;

    if (passwordData.new !== passwordData.confirm) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordData.new.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    try {
      const getRes = await fetch(`http://localhost:5107/api/Users/${user.id}`);
      if (!getRes.ok) {
        setError("Failed to verify user credentials.");
        return;
      }
      
      const userData = await getRes.json();
      
      if (userData.password !== passwordData.current) {
        setError("Current password is incorrect.");
        return;
      }
      
      // Update password
      const updatePayload = {
        id: userData.id,
        name: userData.name,
        email: userData.loginId,
        password: passwordData.new,
        role: userData.role,
        createdAt: userData.createdDate
      };
      
      const putRes = await fetch(`http://localhost:5107/api/Users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });
      
      if (!putRes.ok && putRes.status !== 204) {
        setError("Failed to update password.");
        return;
      }
      
      setSuccess("Password updated successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setError("An error occurred while updating the password.");
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login");
  };

  return (
    <main className="patient-dashboard-content">
      <PageHeader
        title="Hospital Settings"
        subtitle="Manage facility credentials, notifications, and security preferences"
      />

      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          <AlertCircle size={18} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Card 1: Change Password */}
        <Card>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "var(--text-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <KeyRound size={20} style={{ color: "var(--primary)" }} /> Change Password
          </h3>

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Current Password"
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              required
            />

            <div className="form-row">
              <Input
                label="New Password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Button variant="primary" type="submit" style={{ height: "44px" }}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* Card 2: Notification Preferences */}
        <Card>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "var(--text-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Bell size={20} style={{ color: "var(--primary)" }} /> Notification Preferences
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14.5px", color: "var(--text-heading)" }}>Appointment Booking Alerts</div>
                <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Receive alerts when patients book with your doctors.</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.appointmentAlerts}
                onChange={(e) => setNotifications({ ...notifications, appointmentAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14.5px", color: "var(--text-heading)" }}>Cancellation Notifications</div>
                <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Receive alerts when appointments are cancelled.</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.cancellationAlerts}
                onChange={(e) => setNotifications({ ...notifications, cancellationAlerts: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Session Security */}
        <Card>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "var(--text-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <ShieldCheck size={20} style={{ color: "var(--primary)" }} /> Account Security
          </h3>

          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5" }}>
            Sign out of your active hospital administrator session.
          </p>

          <Button
            variant="outline"
            onClick={handleLogout}
            style={{
              height: "44px",
              color: "#dc2626",
              borderColor: "#fca5a5",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <LogOut size={16} /> Log Out Securely
          </Button>
        </Card>
      </div>
    </main>
  );
}

export default HospitalSettings;
