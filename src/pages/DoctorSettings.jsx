import { useState } from "react";
import {
  LogOut,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearCurrentUser } from "../utils/auth";

import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import "../pages/AdminShared.css";

function DoctorSettings() {
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    appointmentReminders: true,
    cancellationAlerts: true
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (passwordData.new !== passwordData.confirm) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (!passwordData.new) {
      setError("Please enter a new password.");
      return;
    }

    try {
      const currentUser = getCurrentUser();

      if (!currentUser?.id) {
        setError("User session not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5107/api/Users/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: currentUser.name,
            email: currentUser.email,
            password: passwordData.new,
            role: currentUser.role
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update password.");
      }

      setPasswordData({
        current: "",
        new: "",
        confirm: ""
      });

      setSuccess("Password updated successfully.");
    } catch (err) {
      console.error("Password update error:", err);
      setError("Unable to update password. Please try again.");
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/login");
  };

  return (
    <main className="patient-dashboard-content">
      {/* 1. Page Header */}
      <section
        className="greeting-section"
        style={{ marginBottom: "20px" }}
      >
        <h2 className="greeting-title">Settings</h2>
        <p className="greeting-subtitle">
          Manage your account preferences and security settings.
        </p>
      </section>

      {/* Success Message */}
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

      {/* Error Message */}
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

      {/* 2. Settings Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}
      >
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
            <KeyRound
              size={20}
              style={{ color: "var(--primary)" }}
            />
            Change Password
          </h3>

          <form
            onSubmit={handlePasswordChange}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <Input
              label="Current Password"
              type="password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  current: e.target.value
                })
              }
              required
            />

            <div className="form-row">
              <Input
                label="New Password"
                type="password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new: e.target.value
                  })
                }
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirm: e.target.value
                  })
                }
                required
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px"
              }}
            >
              <Button
                variant="primary"
                type="submit"
                style={{ height: "44px" }}
              >
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
            <Bell
              size={20}
              style={{ color: "var(--primary)" }}
            />
            Notification Preferences
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border)"
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14.5px",
                    color: "var(--text-heading)"
                  }}
                >
                  Email Notifications
                </div>

                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-muted)"
                  }}
                >
                  Receive email updates for new patient bookings.
                </div>
              </div>

              <input
                type="checkbox"
                checked={notificationSettings.emailAlerts}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailAlerts: e.target.checked
                  })
                }
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "var(--primary)",
                  cursor: "pointer"
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--border)"
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14.5px",
                    color: "var(--text-heading)"
                  }}
                >
                  Appointment Reminders
                </div>

                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-muted)"
                  }}
                >
                  Receive daily appointment schedule summaries.
                </div>
              </div>

              <input
                type="checkbox"
                checked={notificationSettings.appointmentReminders}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    appointmentReminders: e.target.checked
                  })
                }
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "var(--primary)",
                  cursor: "pointer"
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14.5px",
                    color: "var(--text-heading)"
                  }}
                >
                  Cancellation Alerts
                </div>

                <div
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-muted)"
                  }}
                >
                  Get instant alerts when a patient cancels or reschedules.
                </div>
              </div>

              <input
                type="checkbox"
                checked={notificationSettings.cancellationAlerts}
                onChange={(e) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    cancellationAlerts: e.target.checked
                  })
                }
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "var(--primary)",
                  cursor: "pointer"
                }}
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Session & Account Security */}
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
            <ShieldCheck
              size={20}
              style={{ color: "var(--primary)" }}
            />
            Session & Account Security
          </h3>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              marginBottom: "20px",
              lineHeight: "1.5"
            }}
          >
            Log out of your active session on this device. You will need
            your Login ID and password to sign back in.
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
            <LogOut size={16} />
            Log Out Securely
          </Button>
        </Card>
      </div>
    </main>
  );
}

export default DoctorSettings;