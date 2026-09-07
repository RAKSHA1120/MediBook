import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Eye, Users, UserCheck, CalendarCheck, Clock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import "../pages/AdminShared.css";
import "../pages/AdminDashboard.css";

function DoctorPatients() {
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Helper to format backend time strings (e.g. "10:30:00" -> "10:30 AM")
  const formatBackendTime = (timeStr) => {
    if (!timeStr) return "10:30 AM";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hh = String(hours).padStart(2, "0");
      return `${hh}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  // Map backend response fields to frontend contract
  const normalizeBackendAppointment = (apt) => {
    const rawDate = apt.appointmentDate ? String(apt.appointmentDate).split("T")[0] : "";
    const displayTime = formatBackendTime(apt.appointmentTime);
    const apptReason = apt.reason || apt.appointmentType || "Consultation";

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName || "Patient",
      doctorId: apt.doctorId,
      doctorName: apt.doctorName || "Doctor",
      hospitalId: apt.hospitalId,
      hospitalName: apt.hospitalName || "MediCare Hospital",
      hospital: apt.hospitalName || "MediCare Hospital",
      appointmentDate: apt.appointmentDate,
      date: rawDate,
      time: displayTime,
      appointmentTime: apt.appointmentTime,
      status: apt.status || "Pending",
      appointmentType: apt.appointmentType || "Consultation",
      specialty: apt.appointmentType || "Consultation",
      type: apptReason,
      reason: apptReason,
      consultationFee: apt.consultationFee ?? 500,
      fee: apt.consultationFee ?? 500,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    };
  };

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    const rawDocId = user?.doctorId || doc?.id || user?.refId || user?.id;

    const docIdInt = rawDocId || "";

    try {
      if (!docIdInt) {
        setDoctorPatients([]);
        return;
      }
      const response = await fetch(`http://localhost:5107/api/Appointments/doctor/${docIdInt}`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      const myAppts = Array.isArray(data) ? data.map(normalizeBackendAppointment) : [];

      const patientMap = new Map();

      myAppts.forEach((apt) => {
        const pIdStr = String(apt.patientId ?? "").trim();
        const pNameStr = String(apt.patientName || apt.patient || "").trim();

        const resolvedId = pIdStr !== "" && pIdStr.toLowerCase() !== "n/a" ? pIdStr : `P-${pNameStr.replace(/\s+/g, "")}`;
        const key = String(resolvedId).trim().toLowerCase();
        const aptDate = apt.date || "Today";

        if (!patientMap.has(key)) {
          patientMap.set(key, {
            id: resolvedId,
            name: pNameStr || "Patient",
            age: "N/A",
            gender: "N/A",
            contact: apt.patientContact || apt.contact || "N/A",
            email: "N/A",
            status: "Active",
            lastAppointment: aptDate,
            appointmentsCount: 1
          });
        } else {
          const existing = patientMap.get(key);
          existing.appointmentsCount += 1;
          if (aptDate && aptDate !== "Today") {
            if (!existing.lastAppointment || existing.lastAppointment === "Today" || new Date(aptDate) > new Date(existing.lastAppointment)) {
              existing.lastAppointment = aptDate;
            }
          }
        }
      });

      setDoctorPatients(Array.from(patientMap.values()));
    } catch (err) {
      console.error("Error loading doctor patients from backend:", err);
      setError("Unable to connect to backend server. Please verify ASP.NET Core API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
    window.addEventListener("medibook_appointments_updated", loadPatients);
    return () => window.removeEventListener("medibook_appointments_updated", loadPatients);
  }, [loadPatients]);

  // Stats calculation
  const activeCount = useMemo(() => {
    return doctorPatients.filter((p) => String(p.status ?? "").toLowerCase() === "active").length;
  }, [doctorPatients]);

  const recentCount = useMemo(() => {
    return doctorPatients.filter((p) => p.lastAppointment && p.lastAppointment !== "No appointments").length;
  }, [doctorPatients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    const searchLower = String(searchTerm ?? "").toLowerCase().trim();
    if (searchLower === "") return doctorPatients;

    return doctorPatients.filter((p) => {
      const pName = String(p.name ?? "").toLowerCase();
      const pContact = String(p.contact ?? "").toLowerCase();
      return pName.includes(searchLower) || pContact.includes(searchLower);
    });
  }, [doctorPatients, searchTerm]);

  return (
    <main className="patient-dashboard-content">
      {/* 1. Page Header */}
      <section className="greeting-section" style={{ marginBottom: "20px" }}>
        <h2 className="greeting-title">My Patients</h2>
        <p className="greeting-subtitle">Patients you have consulted or have upcoming appointments with.</p>
      </section>

      {/* 2. Compact Statistics Cards Grid */}
      <section className="admin-stats-grid" style={{ marginBottom: "20px" }}>
        {/* Total Patients */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Patients</span>
            <div className="admin-stat-icon-wrapper">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{doctorPatients.length}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Total assigned patients</div>
        </div>

        {/* Active Patients */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Active Patients</span>
            <div className="admin-stat-icon-wrapper">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{activeCount}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Patients under active care</div>
        </div>

        {/* Recently Consulted */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Recently Consulted</span>
            <div className="admin-stat-icon-wrapper">
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-stat-number">{recentCount}</div>
          <div className="admin-stat-divider" />
          <div className="admin-stat-subtext">Recent consultation records</div>
        </div>
      </section>

      {/* 3. Search Bar Card */}
      <div
        className="filters-bar"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div className="filter-search-wrapper" style={{ position: "relative", width: "100%" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            className="form-input"
            style={{ paddingLeft: "42px", height: "44px", width: "100%" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Patient Count Line */}
      <div
        className="appointment-count-text"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "var(--text-muted)",
          marginBottom: "12px"
        }}
      >
        Showing <strong>{filteredPatients.length}</strong> of <strong>{doctorPatients.length}</strong> patients
      </div>

      {/* 5. Patient Table / Empty State / Loading State */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
              Loading assigned patients...
            </p>
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load patients"
            description={error}
            icon={AlertCircle}
            actionLabel="Try Again"
            onAction={loadPatients}
          />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title="No patients found."
            description="Try searching with a different name or phone number."
            icon={Users}
            actionLabel="Clear Search"
            onAction={() => setSearchTerm("")}
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PATIENT</th>
                  <th>AGE & GENDER</th>
                  <th>CONTACT</th>
                  <th>LAST APPOINTMENT</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((pt) => {
                  const rawName = String(pt.name ?? "Patient").trim();
                  const initials = rawName
                    .split(" ")
                    .map((n) => (n && n[0] ? n[0] : ""))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase() || "P";

                  const rawId = String(pt.id ?? "").trim();
                  const patientIdDisplay =
                    rawId !== "" && rawId.toLowerCase() !== "n/a" ? rawId : null;

                  const ageGenderText = pt.gender && pt.gender !== "N/A"
                    ? `${pt.age}, ${pt.gender}`
                    : pt.age;

                  return (
                    <tr key={pt.id}>
                      <td>
                        <div className="user-info-cell">
                          <div className="user-avatar">{initials}</div>
                          <div className="user-details">
                            <span className="user-name">{rawName}</span>
                            {patientIdDisplay && (
                              <span className="user-subtext">{patientIdDisplay}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="nowrap">
                        <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                          {ageGenderText}
                        </span>
                      </td>
                      <td className="nowrap">
                        <span style={{ color: "var(--text-primary)" }}>
                          {pt.contact || pt.phone || "N/A"}
                        </span>
                      </td>
                      <td className="nowrap">
                        <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                          {pt.lastAppointment || "No appointments"}
                        </span>
                      </td>
                      <td className="nowrap">
                        <StatusBadge status={pt.status || "Active"} />
                      </td>
                      <td className="nowrap" style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="icon-action-btn"
                          title="View Patient"
                          onClick={() => navigate(`/doctor/patients/${pt.id}`)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--primary)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default DoctorPatients;
