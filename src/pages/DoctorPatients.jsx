import { useState, useEffect, useMemo } from "react";
import { Search, Eye, Users, UserCheck, CalendarCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAppointmentsForDoctor, getCurrentUser, getCurrentDoctor, getPatients } from "../utils/storage";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import "../pages/AdminShared.css";
import "../pages/AdminDashboard.css";

function DoctorPatients() {
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
    window.addEventListener("medibook_appointments_updated", loadPatients);
    return () => window.removeEventListener("medibook_appointments_updated", loadPatients);
  }, []);

  const loadPatients = () => {
    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    if (user || doc) {
      const docId = doc?.id ?? user?.refId ?? user?.id;
      const docName = doc?.name ?? user?.name;

      const myAppts = getAppointmentsForDoctor(docId, docName);
      const allPatients = getPatients();
      const patientMap = new Map();

      myAppts.forEach((apt) => {
        const pIdStr = String(apt.patientId ?? "").trim();
        const pNameStr = String(apt.patientName || apt.patient || "").trim();

        let matchedPatient = allPatients.find((p) => {
          const idStr = String(p.id ?? "").trim();
          const nameStr = String(p.name ?? "").toLowerCase().trim();
          return (
            (pIdStr !== "" && pIdStr.toLowerCase() !== "n/a" && idStr.toLowerCase() === pIdStr.toLowerCase()) ||
            (pNameStr !== "" && nameStr === pNameStr.toLowerCase())
          );
        });

        const resolvedId = matchedPatient?.id || (pIdStr !== "" && pIdStr.toLowerCase() !== "n/a" ? pIdStr : `P-${pNameStr.replace(/\s+/g, "")}`);
        const key = String(resolvedId).trim().toLowerCase();
        const aptDate = apt.date || "Today";

        if (!patientMap.has(key)) {
          patientMap.set(key, {
            id: matchedPatient?.id || (pIdStr !== "" && pIdStr.toLowerCase() !== "n/a" ? pIdStr : "P-101"),
            name: matchedPatient?.name || pNameStr || "Patient",
            age: matchedPatient?.age ? `${matchedPatient.age} yrs` : (matchedPatient?.ageGender ? String(matchedPatient.ageGender) : "32 yrs"),
            gender: matchedPatient?.gender || "Male",
            contact: matchedPatient?.contact || matchedPatient?.phone || apt.patientContact || apt.contact || "N/A",
            email: matchedPatient?.email || "N/A",
            status: matchedPatient?.status || "Active",
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
    }
  };

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

      {/* 5. Patient Table / Empty State */}
      <div className="admin-table-card">
        {filteredPatients.length === 0 ? (
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
