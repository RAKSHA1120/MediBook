import { useState, useEffect, useMemo } from "react";
import { Users, Shield, Stethoscope, UserCheck, User, Eye, EyeOff, Copy, Check, MoreVertical, AlertTriangle, KeyRound, Building2, Sparkles } from "lucide-react";
import PageHeader from "../components/PageHeader";
import SearchBox from "../components/SearchBox";
import Button from "../components/Button";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { api } from "../utils/api";
import {
  getProvisionedCredential,
  consumeProvisionedCredential,
  generateStrongRolePassword
} from "../utils/credentialStore";

import "./AdminDashboard.css";
import "./AdminShared.css";

function AdminLoginManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionUser, setActionUser] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Login Credentials Modal State (Credential provisioning & safe reset workflow)
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [credUser, setCredUser] = useState(null);
  const [credStep, setCredStep] = useState("VIEW"); // "VIEW" | "PROVISIONED_VIEW" | "EDIT" | "SUCCESS"
  const [credPasswordInput, setCredPasswordInput] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [credError, setCredError] = useState(null);
  const [newlySavedPassword, setNewlySavedPassword] = useState("");
  const [copiedNewPass, setCopiedNewPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    try {
      const res = await api.get("/Users");
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".more-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSearchChange = (val) => {
    if (typeof val === "string") {
      setSearchTerm(val);
    } else if (val && val.target) {
      setSearchTerm(val.target.value || "");
    } else {
      setSearchTerm("");
    }
  };

  // Dynamic KPI Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const admin = users.filter(u => (u.role || "").toLowerCase() === "admin").length;
    const doctor = users.filter(u => (u.role || "").toLowerCase() === "doctor").length;
    const patient = users.filter(u => (u.role || "").toLowerCase() === "patient").length;
    const hospital = users.filter(u => (u.role || "").toLowerCase() === "hospital").length;
    const active = users.filter(u => (u.status || "Active") === "Active").length;

    return { total, admin, doctor, patient, hospital, active };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const query = searchTerm.toLowerCase().trim();
      const name = (u.name || "").toLowerCase();
      const loginId = (u.loginId || u.mobile || "").toLowerCase();
      const role = (u.role || "").toLowerCase();

      const matchesSearch = !query || name.includes(query) || loginId.includes(query) || role.includes(query);
      const matchesRole = roleFilter === "All" || role === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === "All" || (u.status || "Active") === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Role Badge Styling
  const getRoleBadgeStyle = (role) => {
    const r = (role || "").toLowerCase();
    switch (r) {
      case "admin":
        return { background: "#f3e8ff", color: "#7c3aed", border: "1px solid #ddd6fe" };
      case "doctor":
        return { background: "var(--primary-soft)", color: "var(--primary)", border: "1px solid rgba(47, 111, 163, 0.2)" };
      case "hospital":
        return { background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" };
      default:
        return { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" };
    }
  };

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Account Enable / Disable Toggle Prompt
  const handlePromptStatusToggle = (user) => {
    setActionUser(user);
    setIsStatusModalOpen(true);
  };

  const confirmStatusToggle = async () => {
    if (!actionUser) return;
    setIsStatusUpdating(true);
    try {
      const currentStatus = actionUser.status || "Active";
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      const res = await api.put(`/Users/${actionUser.id}/status`, { status: newStatus });
      if (res.success) {
        await loadUsersData();
      } else {
        alert(res.error || "Failed to update account status.");
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update account status.");
    } finally {
      setIsStatusUpdating(false);
      setIsStatusModalOpen(false);
      setActionUser(null);
    }
  };

  // ==========================================
  // Login Credentials & Safe Reset Handlers
  // ==========================================

  // ==========================================
  // Login Credentials & Provisioning Handlers
  // ==========================================

  // Opening "Login Credentials" strictly reads data; NEVER changes the password.
  const handleOpenCredentials = (user) => {
    setCredUser(user);
    // Check if account has an initial password in transient memory (e.g. newly created Doctor/Hospital)
    const provisioned = getProvisionedCredential(user.loginId || user.id);
    if (provisioned && provisioned.password) {
      setNewlySavedPassword(provisioned.password);
      setCredStep("PROVISIONED_VIEW");
    } else {
      setCredStep("VIEW");
      setNewlySavedPassword("");
    }
    setCredPasswordInput("");
    setShowPasswordText(false);
    setShowConfirmPrompt(false);
    setIsUpdatingPassword(false);
    setCredError(null);
    setCopiedNewPass(false);
    setCopiedAll(false);
    setIsCredModalOpen(true);
  };

  const handleCloseCredentials = () => {
    if (credUser) {
      // Consume the provisioned credential so it is only shown once in transient state as requested
      consumeProvisionedCredential(credUser.loginId || credUser.id);
    }
    setIsCredModalOpen(false);
    setCredUser(null);
    setCredStep("VIEW");
    setCredPasswordInput("");
    setShowPasswordText(false);
    setShowConfirmPrompt(false);
    setIsUpdatingPassword(false);
    setCredError(null);
    setNewlySavedPassword("");
    setCopiedNewPass(false);
    setCopiedAll(false);
  };

  // Flow step: Set New Password (Admin explicitly initiates editing)
  const handleStartSetNewPassword = () => {
    setCredStep("EDIT");
    // Generate initial strong password suggestion for convenience
    const suggested = generateStrongRolePassword(credUser?.role);
    setCredPasswordInput(suggested);
    setShowPasswordText(true);
    setShowConfirmPrompt(false);
    setCredError(null);
  };

  // Helper to re-generate strong password
  const handleGeneratePassword = () => {
    const generated = generateStrongRolePassword(credUser?.role);
    setCredPasswordInput(generated);
    setShowPasswordText(true);
    setCredError(null);
  };

  // Flow step: Cancel at any point leaves existing password completely unchanged
  const handleCancelSetNewPassword = () => {
    const provisioned = getProvisionedCredential(credUser?.loginId || credUser?.id);
    if (provisioned && provisioned.password) {
      setCredStep("PROVISIONED_VIEW");
    } else {
      setCredStep("VIEW");
    }
    setCredPasswordInput("");
    setShowPasswordText(false);
    setShowConfirmPrompt(false);
    setCredError(null);
  };

  // Role-specific password validation:
  // Patient: strict strong-password rules (8+ chars, upper, lower, number, special char)
  // Admin, Doctor, Hospital: preserve existing rules (non-empty password)
  const validatePasswordForRole = (password, role) => {
    if (!password || !password.trim()) {
      return "Password is required.";
    }
    const isPatient = (role || "").toLowerCase() === "patient";
    if (isPatient) {
      const trimmed = password.trim();
      if (trimmed.length < 8) {
        return "Password must be at least 8 characters long.";
      }
      if (!/[A-Z]/.test(trimmed)) {
        return "Password must contain at least one uppercase letter (A-Z).";
      }
      if (!/[a-z]/.test(trimmed)) {
        return "Password must contain at least one lowercase letter (a-z).";
      }
      if (!/[0-9]/.test(trimmed)) {
        return "Password must contain at least one number (0-9).";
      }
      if (!/[^a-zA-Z0-9]/.test(trimmed)) {
        return "Password must contain at least one special character.";
      }
    }
    return null;
  };

  // Flow step: Save Password clicked -> validate then show confirmation prompt
  const handlePromptSavePassword = () => {
    setCredError(null);
    const validationError = validatePasswordForRole(credPasswordInput, credUser?.role);
    if (validationError) {
      setCredError(validationError);
      return;
    }
    setShowConfirmPrompt(true);
  };

  // Flow step: Cancel confirmation returns to editing without saving
  const handleCancelConfirm = () => {
    setShowConfirmPrompt(false);
  };

  // Flow step: "Yes, Update Password" -> calls backend API to update password
  const handleConfirmSavePassword = async () => {
    if (!credUser) return;
    setIsUpdatingPassword(true);
    setCredError(null);

    try {
      const targetPass = credPasswordInput.trim();
      const res = await api.post(`/Users/${credUser.id}/reset-password`, {
        newPassword: targetPass
      });

      if (res.success) {
        setNewlySavedPassword(targetPass);
        setCredStep("SUCCESS");
        setShowConfirmPrompt(false);
      } else {
        setCredError(res.error || "Failed to update password.");
        setShowConfirmPrompt(false);
      }
    } catch (err) {
      console.error("Failed to update password", err);
      setCredError("An unexpected error occurred while updating the password.");
      setShowConfirmPrompt(false);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Copy new password helper in success/provisioned state
  const handleCopyNewPassword = (pass) => {
    const passwordToCopy = pass || newlySavedPassword;
    if (passwordToCopy) {
      navigator.clipboard.writeText(passwordToCopy);
      setCopiedNewPass(true);
      setTimeout(() => setCopiedNewPass(false), 2500);
    }
  };

  // Copy full credentials summary for easy sharing with newly registered Doctor/Hospital
  const handleCopyAllCredentials = (pass) => {
    const passwordToCopy = pass || newlySavedPassword;
    if (credUser && passwordToCopy) {
      const summary = `MediBook Login Credentials\n--------------------------\nName: ${credUser.name || "User"}\nRole: ${credUser.role}\nLogin ID / Username: ${credUser.loginId}\nPassword: ${passwordToCopy}`;
      navigator.clipboard.writeText(summary);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  // Alias for backward compatibility if invoked anywhere
  const handleOpenResetPassword = handleOpenCredentials;

  // Date Formatter Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      }
    } catch (e) {}
    return dateStr;
  };

  return (
    <div className="patient-dashboard-content">
      {/* 1. Page Header */}
      <PageHeader
        title="Login Management"
        subtitle="Manage authentication credentials, user roles, and account access levels"
      />

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Accounts</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.total}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">All registered user accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Admin Accounts</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
              <Shield size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.admin}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">System administrators</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Doctor Accounts</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#eff6ff", color: "var(--primary)" }}>
              <Stethoscope size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.doctor}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Registered doctor accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Patient Accounts</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#059669" }}>
              <User size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.patient}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Registered patient accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Hospital Accounts</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Building2 size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.hospital}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Registered hospital accounts</span>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Active Accounts</span>
            <div className="admin-stat-icon-wrapper" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{stats.active}</div>
          <div className="admin-stat-divider" />
          <span className="admin-stat-subtext">Currently active accounts</span>
        </div>
      </div>

      {/* 3. Search and Filter Card */}
      <div className="admin-table-card">
        <div className="admin-toolbar" style={{ flexWrap: "wrap", gap: "12px", padding: "14px 20px" }}>
          <div style={{ flex: "1 1 320px", minWidth: "260px" }}>
            <SearchBox
              placeholder="Search by name, login ID, or role..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Role Filter Dropdown */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
              <option value="Hospital">Hospital</option>
            </select>

            {/* Status Filter Dropdown */}
            <select
              className="form-select"
              style={{ height: "40px", padding: "0 12px", fontSize: "13.5px", width: "auto", borderRadius: "8px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* 4. Result Count Strip */}
        <div style={{ padding: "10px 20px", backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)", fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
          Showing <strong style={{ color: "var(--text-heading)" }}>{filteredUsers.length}</strong> of <strong style={{ color: "var(--text-heading)" }}>{users.length}</strong> accounts
        </div>

        {/* 5. 6-Column Accounts Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "26%" }}>USER</th>
                <th style={{ width: "22%" }}>LOGIN ID / USERNAME</th>
                <th style={{ width: "14%" }}>ROLE</th>
                <th style={{ width: "14%" }}>ACCOUNT STATUS</th>
                <th style={{ width: "14%" }}>CREATED DATE</th>
                <th style={{ width: "10%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const roleStyle = getRoleBadgeStyle(user.role);
                const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";
                const userKey = user.id || user.loginId;
                const loginIdentifier = user.loginId || "N/A";
                const createdDate = formatDate(user.createdDate || user.createdAt);

                // Subtext resolution: clear user/profile IDs
                let subtext = `User ID: #${user.id}`;
                const roleLower = (user.role || "").toLowerCase();
                if (roleLower === "doctor") {
                  subtext = user.doctorId
                    ? `Doc ID: #${user.doctorId} | User ID: #${user.id}`
                    : `User ID: #${user.id} (No Doctor Profile)`;
                } else if (roleLower === "patient" && user.refId) {
                  subtext = `Patient ID: #${user.refId} | User ID: #${user.id}`;
                } else if (roleLower === "hospital") {
                  const hId = user.hospitalId || user.refId;
                  subtext = hId
                    ? `Hospital ID: #${hId} | User ID: #${user.id}`
                    : `User ID: #${user.id} (No Hospital Profile)`;
                }

                return (
                  <tr key={userKey}>
                    {/* USER */}
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar" style={{ background: roleStyle.background, color: roleStyle.color }}>
                          {initials}
                        </div>
                        <div className="user-details">
                          <span className="user-name" style={{ fontSize: "14px", fontWeight: "600" }}>
                            {user.name || "User"}
                          </span>
                          <span className="user-subtext" style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {subtext}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* LOGIN ID / USERNAME */}
                    <td>
                      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-heading)" }}>
                        {loginIdentifier}
                      </span>
                    </td>

                    {/* ROLE BADGE */}
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        ...roleStyle
                      }}>
                        {user.role || "User"}
                      </span>
                    </td>

                    {/* ACCOUNT STATUS */}
                    <td className="nowrap">
                      <StatusBadge status={user.status || "Active"} />
                    </td>

                    {/* CREATED DATE */}
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>
                        {createdDate}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="nowrap text-right" style={{ textAlign: "right" }}>
                      <div className="table-actions-cell">
                        {/* Login Credentials Button */}
                        <button
                          className="icon-action-btn"
                          title="Login Credentials"
                          aria-label="Login Credentials"
                          onClick={() => handleOpenCredentials(user)}
                        >
                          <KeyRound size={17} />
                        </button>

                        {/* View Details Button */}
                        <button
                          className="icon-action-btn"
                          title="View Account Details"
                          aria-label="View Account Details"
                          onClick={() => { setSelectedUser(user); setIsViewModalOpen(true); }}
                        >
                          <Eye size={17} />
                        </button>

                        {/* More Menu Dropdown */}
                        <div className="more-menu-container">
                          <button
                            className={`icon-action-btn ${openMenuId === userKey ? "active" : ""}`}
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === userKey ? null : userKey);
                            }}
                          >
                            <MoreVertical size={17} />
                          </button>

                          {openMenuId === userKey && (
                            <div className="more-menu-dropdown">
                              <button
                                className="more-menu-item"
                                onClick={() => {
                                  handleOpenCredentials(user);
                                  setOpenMenuId(null);
                                }}
                              >
                                Login Credentials
                              </button>
                              <button
                                className="more-menu-item"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsViewModalOpen(true);
                                  setOpenMenuId(null);
                                }}
                              >
                                View Account Details
                              </button>
                              <button
                                className={`more-menu-item ${(user.status || "Active") === "Active" ? "danger" : ""}`}
                                onClick={() => {
                                  handlePromptStatusToggle(user);
                                  setOpenMenuId(null);
                                }}
                              >
                                {(user.status || "Active") === "Active" ? "Disable Account" : "Enable Account"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No user accounts found matching your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Account Details Modal (Strictly No Plain Password Exposure) */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title="User Account Details"
        className="hospital-modal-container"
      >
        {selectedUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              {/* User Name */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>USER NAME</label>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-heading)", marginTop: "4px" }}>
                  {selectedUser.name || "User"}
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>USER ID</label>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--primary)", marginTop: "4px" }}>
                  #{selectedUser.id}
                </div>
              </div>

              {/* Doctor ID / Reference ID (if applicable) */}
              {(selectedUser.role || "").toLowerCase() === "doctor" && (
                <div>
                  <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>DOCTOR ID</label>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                    {selectedUser.doctorId ? `#${selectedUser.doctorId}` : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>No linked profile</span>}
                  </div>
                </div>
              )}

              {/* Hospital ID (if applicable) */}
              {(selectedUser.role || "").toLowerCase() === "hospital" && (
                <div>
                  <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>HOSPITAL ID</label>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-heading)", marginTop: "4px" }}>
                    {selectedUser.hospitalId || selectedUser.refId ? `#${selectedUser.hospitalId || selectedUser.refId}` : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "13px" }}>No linked profile</span>}
                  </div>
                </div>
              )}

              {/* Role */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>ROLE</label>
                <div style={{ marginTop: "4px" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "capitalize",
                    ...getRoleBadgeStyle(selectedUser.role)
                  }}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>ACCOUNT ACCESS STATUS</label>
                <div style={{ marginTop: "4px" }}>
                  <StatusBadge status={selectedUser.status || "Active"} />
                </div>
              </div>

              {/* Login ID / Username + Copy Button */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>LOGIN ID / USERNAME</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)" }}>
                    {selectedUser.loginId}
                  </span>
                  <button
                    type="button"
                    title="Copy Login ID"
                    onClick={() => handleCopy(selectedUser.loginId, "loginId")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: copiedField === "loginId" ? "#10b981" : "var(--text-muted)", padding: "2px" }}
                  >
                    {copiedField === "loginId" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Account Created Date */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>ACCOUNT CREATED DATE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {formatDate(selectedUser.createdDate || selectedUser.createdAt)}
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => {
                  const u = selectedUser;
                  setIsViewModalOpen(false);
                  handleOpenCredentials(u);
                }}
              >
                <KeyRound size={15} /> Login Credentials
              </button>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Disable / Enable Account Confirmation Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => { setIsStatusModalOpen(false); setActionUser(null); }}
        title={(actionUser?.status || "Active") === "Active" ? "Disable User Account" : "Enable User Account"}
        className="hospital-modal-container"
      >
        {actionUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              {(actionUser.status || "Active") === "Active" && (
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle size={20} />
                </div>
              )}
              <div>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "var(--text-heading)" }}>
                  {(actionUser.status || "Active") === "Active"
                    ? `Disable ${actionUser.name}'s account?`
                    : `Enable ${actionUser.name}'s account?`}
                </h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0 }}>
                  {(actionUser.status || "Active") === "Active"
                    ? "Disabling this account will prevent the user from logging in to MediBook. Existing system records will be retained."
                    : "Enabling this account will restore system login access for this user."}
                </p>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "10px" }}>
              <Button variant="outline" type="button" disabled={isStatusUpdating} onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                disabled={isStatusUpdating}
                style={(actionUser.status || "Active") === "Active" ? { backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#ffffff" } : {}}
                onClick={confirmStatusToggle}
              >
                {isStatusUpdating ? "Updating..." : ((actionUser.status || "Active") === "Active" ? "Disable Account" : "Enable Account")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Login Credentials Modal */}
      <Modal
        isOpen={isCredModalOpen}
        onClose={handleCloseCredentials}
        title="Login Credentials"
        className="hospital-modal-container"
      >
        {credUser && (
          <div>
            {/* Step 1A: PROVISIONED_VIEW - Newly Provisioned Account with Initial Password in Transient Memory */}
            {credStep === "PROVISIONED_VIEW" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        ACCOUNT CREDENTIALS PROVISIONED
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-heading)", marginTop: "2px" }}>
                        {credUser.name || "User"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#ecfdf5",
                        color: "#059669",
                        border: "1px solid #a7f3d0"
                      }}>
                        Initial Credentials
                      </span>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        ...getRoleBadgeStyle(credUser.role)
                      }}>
                        {credUser.role}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      LOGIN ID / USERNAME
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-heading)", fontFamily: "monospace" }}>
                        {credUser.loginId}
                      </span>
                      <button
                        type="button"
                        title="Copy Login ID"
                        onClick={() => handleCopy(credUser.loginId, "credLoginId")}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: copiedField === "credLoginId" ? "#10b981" : "var(--text-muted)",
                          padding: "3px",
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                      >
                        {copiedField === "credLoginId" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      INITIAL PASSWORD
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "6px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 12px"
                    }}>
                      <span style={{ fontSize: "15.5px", fontWeight: "700", color: "var(--text-heading)", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                        {showPasswordText ? newlySavedPassword : "••••••••••••••••"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setShowPasswordText(!showPasswordText)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            padding: "4px"
                          }}
                          title={showPasswordText ? "Hide password" : "Show password"}
                        >
                          {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyNewPassword(newlySavedPassword)}
                          className="btn btn-outline"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            fontSize: "12px",
                            height: "auto",
                            borderColor: copiedNewPass ? "#10b981" : "var(--border)",
                            color: copiedNewPass ? "#10b981" : "var(--text-primary)"
                          }}
                        >
                          {copiedNewPass ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: "12.5px",
                  color: "#065f46",
                  lineHeight: "1.5",
                  background: "#ecfdf5",
                  borderLeft: "3px solid #10b981",
                  padding: "10px 14px",
                  borderRadius: "0 8px 8px 0"
                }}>
                  These initial login credentials were generated upon account creation. Copy and provide them to the newly registered <strong>{credUser.role}</strong>. Once this modal is closed, the plaintext password is discarded from memory.
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", flexWrap: "wrap", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => handleCopyAllCredentials(newlySavedPassword)}
                    className="btn btn-outline"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      borderColor: copiedAll ? "#10b981" : "var(--border)",
                      color: copiedAll ? "#10b981" : "var(--text-primary)"
                    }}
                  >
                    {copiedAll ? <><Check size={15} /> Copied All Credentials</> : <><Copy size={15} /> Copy All Credentials</>}
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button variant="outline" type="button" onClick={handleStartSetNewPassword}>
                      Set New Password
                    </Button>
                    <Button variant="primary" type="button" onClick={handleCloseCredentials}>
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1B: VIEW Credentials - Existing Account (Original password hashed and unknown) */}
            {credStep === "VIEW" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        USER
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-heading)", marginTop: "2px" }}>
                        {credUser.name || "User"}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        ...getRoleBadgeStyle(credUser.role)
                      }}>
                        {credUser.role}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      LOGIN ID / USERNAME
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-heading)", fontFamily: "monospace" }}>
                        {credUser.loginId}
                      </span>
                      <button
                        type="button"
                        title="Copy Login ID"
                        onClick={() => handleCopy(credUser.loginId, "credLoginId")}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: copiedField === "credLoginId" ? "#10b981" : "var(--text-muted)",
                          padding: "3px",
                          display: "inline-flex",
                          alignItems: "center"
                        }}
                      >
                        {copiedField === "credLoginId" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      PASSWORD
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ fontSize: "18px", letterSpacing: "3px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        ••••••••••••••••
                      </span>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "var(--primary-soft)",
                        color: "var(--primary)"
                      }}>
                        Hashed &amp; Protected
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: "12.5px",
                  color: "var(--text-muted)",
                  lineHeight: "1.5",
                  background: "rgba(47, 111, 163, 0.05)",
                  borderLeft: "3px solid var(--primary)",
                  padding: "10px 14px",
                  borderRadius: "0 8px 8px 0"
                }}>
                  Existing passwords are saved as secure irreversible hashes and cannot be retrieved. To provision credentials for this account, you can explicitly set a new password below.
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                  <Button variant="outline" type="button" onClick={handleCloseCredentials}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    onClick={handleStartSetNewPassword}
                  >
                    <KeyRound size={16} /> Set New Password
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: EDIT / Set New Password */}
            {credStep === "EDIT" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-heading)" }}>
                      {credUser.name}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "6px" }}>
                      ({credUser.loginId})
                    </span>
                  </div>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "600",
                    ...getRoleBadgeStyle(credUser.role)
                  }}>
                    {credUser.role}
                  </span>
                </div>

                {credError && (
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    backgroundColor: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>{credError}</span>
                  </div>
                )}

                {!showConfirmPrompt ? (
                  <>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label className="form-label" style={{ fontSize: "13px", fontWeight: "600", margin: 0 }}>
                          New Password
                        </label>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--primary)",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 4px"
                          }}
                          title="Generate a secure random password"
                        >
                          <Sparkles size={14} /> Generate Strong Password
                        </button>
                      </div>

                      <div style={{ position: "relative" }}>
                        <input
                          type={showPasswordText ? "text" : "password"}
                          className="form-control"
                          style={{ width: "100%", padding: "10px 40px 10px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", fontFamily: showPasswordText ? "monospace" : "inherit" }}
                          value={credPasswordInput}
                          onChange={(e) => { setCredPasswordInput(e.target.value); setCredError(null); }}
                          placeholder={(credUser.role || "").toLowerCase() === "patient" ? "e.g. MediBook@123" : "Enter new password"}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordText(!showPasswordText)}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            padding: "4px"
                          }}
                          title={showPasswordText ? "Hide password" : "Show password"}
                        >
                          {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
                        {(credUser.role || "").toLowerCase() === "patient" ? (
                          <span>
                            <strong>Patient Requirements:</strong> Minimum 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character.
                          </span>
                        ) : (
                          <span>
                            Enter a new password or use <strong>Generate Strong Password</strong> above for this {credUser.role} account.
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <Button variant="outline" type="button" onClick={handleCancelSetNewPassword}>
                        Cancel
                      </Button>
                      <Button variant="primary" type="button" onClick={handlePromptSavePassword}>
                        Save Password
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Exact Confirmation Dialog Before Saving */
                  <div style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "10px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <AlertTriangle size={20} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#92400e" }}>
                          Are you sure you want to set a new password for this account?
                        </div>
                        <p style={{ fontSize: "13px", color: "#b45309", margin: "4px 0 0 0", lineHeight: "1.4" }}>
                          This will immediately update the login password for <strong>{credUser.name}</strong> ({credUser.loginId}).
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                      <Button
                        variant="outline"
                        type="button"
                        disabled={isUpdatingPassword}
                        onClick={handleCancelConfirm}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="button"
                        disabled={isUpdatingPassword}
                        onClick={handleConfirmSavePassword}
                        style={{ backgroundColor: "#d97706", borderColor: "#d97706", color: "#ffffff" }}
                      >
                        {isUpdatingPassword ? "Updating..." : "Yes, Update Password"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: SUCCESS Display */}
            {credStep === "SUCCESS" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#10b981",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Check size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#065f46" }}>
                      Password updated successfully.
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#047857", marginTop: "2px" }}>
                      Account: <strong>{credUser.name}</strong> ({credUser.loginId})
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    NEW PASSWORD:
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "10px 14px"
                  }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-heading)", fontFamily: "monospace", letterSpacing: "0.5px" }}>
                      {newlySavedPassword}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyNewPassword(newlySavedPassword)}
                      className="btn btn-outline"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        fontSize: "13px",
                        height: "auto",
                        borderColor: copiedNewPass ? "#10b981" : "var(--border)",
                        color: copiedNewPass ? "#10b981" : "var(--text-primary)"
                      }}
                    >
                      {copiedNewPass ? (
                        <>
                          <Check size={15} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={15} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    This newly set password is shown once so you can provide it to the user. The database stores only the secure hash.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => handleCopyAllCredentials(newlySavedPassword)}
                    className="btn btn-outline"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      borderColor: copiedAll ? "#10b981" : "var(--border)",
                      color: copiedAll ? "#10b981" : "var(--text-primary)"
                    }}
                  >
                    {copiedAll ? <><Check size={15} /> Copied All Credentials</> : <><Copy size={15} /> Copy All Credentials</>}
                  </button>
                  <Button variant="primary" type="button" onClick={handleCloseCredentials}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminLoginManagement;
