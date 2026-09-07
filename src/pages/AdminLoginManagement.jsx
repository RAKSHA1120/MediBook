import { useState, useEffect, useMemo } from "react";
import { Users, Shield, Stethoscope, UserCheck, User, Eye, EyeOff, Copy, Check, MoreVertical, AlertTriangle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import SearchBox from "../components/SearchBox";
import Button from "../components/Button";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { api } from "../utils/api";

import "./AdminDashboard.css";
import "./AdminShared.css";

function AdminLoginManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [actionUser, setActionUser] = useState(null);
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
    const active = users.filter(u => (u.status || "Active") === "Active").length;

    return { total, admin, doctor, patient, active };
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

  const confirmStatusToggle = () => {
    if (actionUser) {
      const currentStatus = actionUser.status || "Active";
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      const userKey = actionUser.id || actionUser.mobile || actionUser.loginId;
      updateUser(userKey, { status: newStatus });

      // Sync linked doctor or patient record status if refId exists
      if (actionUser.refId) {
        if (actionUser.role === "doctor") {
          updateDoctor(actionUser.refId, { status: newStatus });
        } else if (actionUser.role === "patient") {
          updatePatient(actionUser.refId, { status: newStatus });
        }
      }

      loadUsersData();
      setIsStatusModalOpen(false);
      setActionUser(null);
    }
  };

  // Date Formatter Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "2026-08-20";
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
                <th style={{ width: "24%" }}>USER</th>
                <th style={{ width: "22%" }}>LOGIN ID / USERNAME</th>
                <th style={{ width: "16%" }}>ROLE</th>
                <th style={{ width: "14%" }}>ACCOUNT STATUS</th>
                <th style={{ width: "14%" }}>CREATED DATE</th>
                <th style={{ width: "10%", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const roleStyle = getRoleBadgeStyle(user.role);
                const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";
                const userKey = user.id || user.mobile || user.loginId;
                const loginIdentifier = user.loginId || user.mobile || "N/A";
                const createdDate = formatDate(user.createdDate || user.date);

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
                            {user.id || user.refId || "N/A"}
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
                        {user.role || "user"}
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
                        {/* View Credentials Button */}
                        <button
                          className="icon-action-btn"
                          title="View Credentials"
                          onClick={() => { setSelectedUser(user); setShowPassword(false); setIsViewModalOpen(true); }}
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
                                  setSelectedUser(user);
                                  setShowPassword(false);
                                  setIsViewModalOpen(true);
                                  setOpenMenuId(null);
                                }}
                              >
                                View Credentials
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

      {/* View Credentials & Account Details Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => { setIsViewModalOpen(false); setShowPassword(false); }} 
        title="User Credentials & Access Details"
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
                  {selectedUser.id || selectedUser.refId || "N/A"}
                </div>
              </div>

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
                    {selectedUser.loginId || selectedUser.mobile}
                  </span>
                  <button
                    type="button"
                    title="Copy Login ID"
                    onClick={() => handleCopy(selectedUser.loginId || selectedUser.mobile, "loginId")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: copiedField === "loginId" ? "#10b981" : "var(--text-muted)", padding: "2px" }}
                  >
                    {copiedField === "loginId" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Password + Masking & Copy Button */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>PASSWORD</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: "600", color: "var(--text-heading)" }}>
                    {showPassword ? (selectedUser.password || "123456") : "••••••••"}
                  </span>
                  <button
                    type="button"
                    title={showPassword ? "Hide Password" : "Show Password"}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "2px" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    title="Copy Password"
                    onClick={() => handleCopy(selectedUser.password || "123456", "password")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: copiedField === "password" ? "#10b981" : "var(--text-muted)", padding: "2px" }}
                  >
                    {copiedField === "password" ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Account Created Date */}
              <div>
                <label className="form-label" style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>ACCOUNT CREATED DATE</label>
                <div style={{ fontSize: "14.5px", fontWeight: "500", color: "var(--text-heading)", marginTop: "4px" }}>
                  {formatDate(selectedUser.createdDate || selectedUser.date)}
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: "8px" }}>
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
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
              <Button variant="outline" type="button" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                style={(actionUser.status || "Active") === "Active" ? { backgroundColor: "#dc2626", borderColor: "#dc2626", color: "#ffffff" } : {}}
                onClick={confirmStatusToggle}
              >
                {(actionUser.status || "Active") === "Active" ? "Disable Account" : "Enable Account"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminLoginManagement;
