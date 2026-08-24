import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Globe,
  Lock,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Trash2,
  Edit2,
  Check,
  X,
  Phone,
  Mail,
  Save
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import {
  getStoredPatientProfile,
  savePatientProfile,
  getPatientInitials
} from "../data/patientProfile";
import "./Settings.css";

const SETTINGS_STORAGE_KEY = "medibook_settings";

const DEFAULT_SETTINGS = {
  notifications: {
    reminders: true,
    confirmations: true,
    changes: true,
    system: true
  },
  preferences: {
    language: "English",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12-hour"
  }
};

const getInitialProfile = () => {
  try {
    const p = getStoredPatientProfile();
    if (p && typeof p === "object") {
      return {
        name: p.name || "Raksha",
        email: p.email || "raksha@example.com",
        phone: p.phone || "+91 98765 43210",
        ...p
      };
    }
  } catch (e) {}
  return {
    name: "Raksha",
    email: "raksha@example.com",
    phone: "+91 98765 43210",
    role: "Patient"
  };
};

const getInitialSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        return {
          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...(parsed.notifications || {})
          },
          preferences: {
            ...DEFAULT_SETTINGS.preferences,
            ...(parsed.preferences || {})
          }
        };
      }
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
};

function Settings() {
  const navigate = useNavigate();

  // Profile State
  const [profile, setProfile] = useState(() => getInitialProfile());
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    name: profile.name || "Raksha",
    email: profile.email || "raksha@example.com",
    phone: profile.phone || "+91 98765 43210"
  });

  // Settings State (Notifications & Preferences)
  const [settings, setSettings] = useState(() => getInitialSettings());

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, type: "success", title: "", message: "" });

  const showNotification = (title, message, type = "success") => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Sync profile if updated elsewhere
  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const updated = getStoredPatientProfile();
        if (updated) {
          setProfile(updated);
          setAccountFormData({
            name: updated.name || "Raksha",
            email: updated.email || "raksha@example.com",
            phone: updated.phone || "+91 98765 43210"
          });
        }
      } catch (e) {}
    };
    window.addEventListener("medibook_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("medibook_profile_updated", handleProfileUpdate);
  }, []);

  // Account Handlers
  const handleSaveAccount = () => {
    if (!accountFormData.name.trim() || !accountFormData.email.trim() || !accountFormData.phone.trim()) {
      showNotification("Validation Error", "All fields are required.", "error");
      return;
    }

    const updatedProfile = {
      ...profile,
      name: accountFormData.name.trim(),
      email: accountFormData.email.trim(),
      phone: accountFormData.phone.trim()
    };

    savePatientProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditingAccount(false);
    showNotification("Account Updated", "Your account settings have been saved.", "success");
  };

  const handleCancelAccountEdit = () => {
    setAccountFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone
    });
    setIsEditingAccount(false);
  };

  // Notification Toggles Handler
  const handleNotificationToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  // Preferences Dropdowns Handler
  const handlePreferenceChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  // Save Settings Handler
  const handleSaveAllSettings = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
    showNotification("Settings Saved", "Settings updated successfully.", "success");
  };

  // Change Password Handler
  const handleUpdatePasswordSubmit = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordError("");
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showNotification("Password Changed", "Password updated successfully.", "success");
  };

  // Delete Account Handler
  const handleConfirmDeleteAccount = () => {
    setShowDeleteModal(false);
    showNotification("Account Deleted", "Account deletion request submitted.", "error");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const initials = getPatientInitials(profile?.name || "Raksha");

  return (
    <div className="settings-page">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        subtitle="Manage your account, notifications, preferences and security settings."
        action={
          <PrimaryButton onClick={handleSaveAllSettings}>
            <Save size={16} style={{ marginRight: "6px" }} />
            Save Changes
          </PrimaryButton>
        }
      />

      {/* 1. Account Settings Card */}
      <div className="settings-section-card">
        <h3 className="settings-card-title">
          <User size={20} />
          <span>Account Settings</span>
        </h3>
        <p className="settings-card-subtitle">Basic details associated with your patient account.</p>

        {!isEditingAccount ? (
          <div className="account-overview-row">
            <div className="account-user-info">
              <div className="account-avatar-circle">{initials}</div>
              <div className="account-text-details">
                <h4 className="account-user-name">{profile?.name || "Raksha"}</h4>
                <div className="account-user-meta">
                  <span>
                    <Mail size={14} />
                    {profile?.email || "raksha@example.com"}
                  </span>
                  <span>
                    <Phone size={14} />
                    {profile?.phone || "+91 98765 43210"}
                  </span>
                </div>
              </div>
            </div>

            <SecondaryButton onClick={() => setIsEditingAccount(true)}>
              <Edit2 size={15} style={{ marginRight: "6px" }} />
              Edit Profile
            </SecondaryButton>
          </div>
        ) : (
          <div className="settings-grid-2col">
            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="settings-name">
                Full Name
              </label>
              <input
                id="settings-name"
                type="text"
                className="settings-field-input"
                value={accountFormData.name}
                onChange={(e) => setAccountFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="settings-phone">
                Mobile Number
              </label>
              <input
                id="settings-phone"
                type="text"
                className="settings-field-input"
                value={accountFormData.phone}
                onChange={(e) => setAccountFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="settings-field-group full-width">
              <label className="settings-field-label" htmlFor="settings-email">
                Email Address
              </label>
              <input
                id="settings-email"
                type="email"
                className="settings-field-input"
                value={accountFormData.email}
                onChange={(e) => setAccountFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="settings-field-group full-width" style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
              <SecondaryButton onClick={handleCancelAccountEdit}>
                <X size={15} style={{ marginRight: "6px" }} />
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleSaveAccount}>
                <Check size={15} style={{ marginRight: "6px" }} />
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>

      {/* 2. Notification Preferences Card */}
      <div className="settings-section-card">
        <h3 className="settings-card-title">
          <Bell size={20} />
          <span>Notification Preferences</span>
        </h3>
        <p className="settings-card-subtitle">Choose which alerts you want to receive.</p>

        <div className="toggle-list">
          <div className="toggle-item-row">
            <div className="toggle-item-text">
              <h4 className="toggle-item-title">Appointment Reminders</h4>
              <p className="toggle-item-desc">Receive reminders before upcoming appointments.</p>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={!!(settings?.notifications?.reminders)}
                onChange={() => handleNotificationToggle("reminders")}
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-item-text">
              <h4 className="toggle-item-title">Appointment Confirmations</h4>
              <p className="toggle-item-desc">Get notified when an appointment is confirmed.</p>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={!!(settings?.notifications?.confirmations)}
                onChange={() => handleNotificationToggle("confirmations")}
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-item-text">
              <h4 className="toggle-item-title">Appointment Changes</h4>
              <p className="toggle-item-desc">Get notified when an appointment is rescheduled or cancelled.</p>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={!!(settings?.notifications?.changes)}
                onChange={() => handleNotificationToggle("changes")}
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-item-text">
              <h4 className="toggle-item-title">System Notifications</h4>
              <p className="toggle-item-desc">Receive important MediBook system updates.</p>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={!!(settings?.notifications?.system)}
                onChange={() => handleNotificationToggle("system")}
              />
              <span className="switch-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Preferences Card */}
      <div className="settings-section-card">
        <h3 className="settings-card-title">
          <Globe size={20} />
          <span>Preferences</span>
        </h3>
        <p className="settings-card-subtitle">Customize regional and date display settings.</p>

        <div className="settings-grid-2col">
          <div className="settings-field-group">
            <label className="settings-field-label" htmlFor="pref-language">
              Language
            </label>
            <select
              id="pref-language"
              className="settings-field-select"
              value={settings?.preferences?.language || "English"}
              onChange={(e) => handlePreferenceChange("language", e.target.value)}
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div className="settings-field-group">
            <label className="settings-field-label" htmlFor="pref-date-format">
              Date Format
            </label>
            <select
              id="pref-date-format"
              className="settings-field-select"
              value={settings?.preferences?.dateFormat || "DD/MM/YYYY"}
              onChange={(e) => handlePreferenceChange("dateFormat", e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="settings-field-group">
            <label className="settings-field-label" htmlFor="pref-time-format">
              Time Format
            </label>
            <select
              id="pref-time-format"
              className="settings-field-select"
              value={settings?.preferences?.timeFormat || "12-hour"}
              onChange={(e) => handlePreferenceChange("timeFormat", e.target.value)}
            >
              <option value="12-hour">12-hour</option>
              <option value="24-hour">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Security Card */}
      <div className="settings-section-card">
        <h3 className="settings-card-title">
          <Lock size={20} />
          <span>Privacy & Security</span>
        </h3>
        <p className="settings-card-subtitle">Manage password and security options.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="security-info-box">
            <ShieldCheck size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
            <span>Your account is protected with secure authentication.</span>
          </div>

          <div>
            <SecondaryButton onClick={() => { setPasswordError(""); setShowPasswordModal(true); }}>
              <Lock size={15} style={{ marginRight: "6px" }} />
              Change Password
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* 6. Danger Zone Card */}
      <div className="settings-section-card danger-zone">
        <h3 className="settings-card-title">
          <AlertTriangle size={20} />
          <span>Danger Zone</span>
        </h3>
        <p className="settings-card-subtitle">Irreversible and account-wide actions.</p>

        <div className="danger-actions-row">
          <SecondaryButton onClick={() => navigate("/login")}>
            <LogOut size={15} style={{ marginRight: "6px" }} />
            Logout
          </SecondaryButton>

          <button
            className="btn-destructive"
            style={{
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-heading)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={15} />
            Delete Account
          </button>
        </div>
      </div>

      {/* 1. Change Password Modal */}
      {showPasswordModal && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {passwordError && (
              <div style={{ padding: "10px 12px", background: "#fef2f2", color: "#dc2626", borderRadius: "6px", fontSize: "13.5px" }}>
                {passwordError}
              </div>
            )}

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="curr-pass">Current Password</label>
              <input
                id="curr-pass"
                type="password"
                className="settings-field-input"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="new-pass">New Password</label>
              <input
                id="new-pass"
                type="password"
                className="settings-field-input"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>

            <div className="settings-field-group">
              <label className="settings-field-label" htmlFor="conf-pass">Confirm New Password</label>
              <input
                id="conf-pass"
                type="password"
                className="settings-field-input"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
              <SecondaryButton onClick={() => setShowPasswordModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleUpdatePasswordSubmit}>Update Password</PrimaryButton>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account?"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ margin: 0, fontSize: "14.5px", color: "var(--text-primary)" }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
              <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
              <button
                style={{
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 16px",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-heading)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                onClick={handleConfirmDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          />
        </div>
      )}
    </div>
  );
}

export default Settings;
