import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getCurrentUser } from "../utils/auth";

import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

import "./AdminDashboard.css";
import "./AdminShared.css";

function HospitalDashboard() {
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format backend time:
  // "10:30:00" -> "10:30 AM"
  const formatBackendTime = (timeStr) => {
    if (!timeStr) return "10:30 AM";

    if (
      typeof timeStr === "string" &&
      (timeStr.includes("AM") || timeStr.includes("PM"))
    ) {
      return timeStr;
    }

    const parts = String(timeStr).split(":");

    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];

      if (Number.isNaN(hours)) {
        return String(timeStr);
      }

      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours || 12;

      const hh = String(hours).padStart(2, "0");

      return `${hh}:${minutes} ${ampm}`;
    }

    return String(timeStr);
  };

  // Convert backend appointment object
  // into frontend-friendly object
  const normalizeBackendAppointment = (apt) => {
    if (!apt) {
      return {
        id: 0,
        patientId: null,
        patientName: "Patient",
        doctorId: null,
        doctorName: "Doctor",
        hospitalId: null,
        hospitalName: "MediCare Hospital",
        hospital: "MediCare Hospital",
        appointmentDate: "",
        date: "",
        time: "10:30 AM",
        appointmentTime: "",
        status: "Pending",
        appointmentType: "Consultation",
        specialty: "Consultation",
        type: "Consultation",
        reason: "Consultation",
        consultationFee: 500,
        fee: 500,
        createdAt: null,
        updatedAt: null
      };
    }

    const rawDate = apt.appointmentDate
      ? String(apt.appointmentDate).split("T")[0]
      : "";

    const displayTime = formatBackendTime(apt.appointmentTime);

    const apptReason =
      apt.reason ||
      apt.appointmentType ||
      "Consultation";

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName || "Patient",

      doctorId: apt.doctorId,
      doctorName: apt.doctorName || "Doctor",

      hospitalId: apt.hospitalId,
      hospitalName:
        apt.hospitalName || "MediCare Hospital",

      hospital:
        apt.hospitalName || "MediCare Hospital",

      appointmentDate: apt.appointmentDate,
      date: rawDate,

      time: displayTime,
      appointmentTime: apt.appointmentTime,

      status: apt.status || "Pending",

      appointmentType:
        apt.appointmentType || "Consultation",

      specialty:
        apt.appointmentType || "Consultation",

      type: apptReason,
      reason: apptReason,

      consultationFee:
        apt.consultationFee ?? 500,

      fee:
        apt.consultationFee ?? 500,

      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    };
  };

  // Load Hospital dashboard data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = getCurrentUser();

      // User must be logged in
      if (!user) {
        navigate("/login");
        return;
      }

      // Only Hospital users can access this dashboard
      const userRole = String(user.role || "").toLowerCase();

      if (userRole !== "hospital") {
        if (userRole === "admin") {
          navigate("/admin/dashboard");
        } else if (userRole === "doctor") {
          navigate("/doctor/dashboard");
        } else if (userRole === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/login");
        }

        return;
      }

      /*
       * Hospital login response:
       *
       * {
       *   id: 4,
       *   loginId: "hospital@medibook.com",
       *   role: "Hospital",
       *   name: "MediCare Hospital",
       *   refId: null
       * }
       *
       * Since refId can be null for Hospital,
       * use the logged-in user's name as the hospital name.
       */

      const hospitalRecord = {
        id: Number(user.refId) || Number(user.id) || 1,
        name: user.name || "MediCare Hospital"
      };

      setHospital(hospitalRecord);

      const hospitalId = Number(hospitalRecord.id) || 1;

      const hospitalName = String(
        hospitalRecord.name || "MediCare Hospital"
      )
        .trim()
        .toLowerCase();

      // Get Doctors and Appointments from ASP.NET API
      const [doctorsRes, appointmentsRes] =
        await Promise.all([
          fetch("http://localhost:5107/api/Doctors"),
          fetch("http://localhost:5107/api/Appointments")
        ]);

      if (!doctorsRes.ok || !appointmentsRes.ok) {
        throw new Error(
          `Server returned error. Doctors: ${doctorsRes.status}, Appointments: ${appointmentsRes.status}`
        );
      }

      const doctorsData = await doctorsRes.json();
      const appointmentsData =
        await appointmentsRes.json();

      // Make sure API responses are arrays
      const allDoctors = Array.isArray(doctorsData)
        ? doctorsData
        : [];

      const allAppointments =
        Array.isArray(appointmentsData)
          ? appointmentsData
          : [];

      // -----------------------------------------
      // Filter doctors belonging to this hospital
      // -----------------------------------------
      const filteredDoctors = allDoctors.filter(
        (doctor) => {
          const doctorHospitalId = Number(
            doctor?.hospitalId ??
            doctor?.hospital?.id ??
            0
          );

          const doctorHospitalName = String(
            doctor?.hospital?.name ||
            doctor?.hospitalName ||
            ""
          )
            .trim()
            .toLowerCase();

          // Match by Hospital ID
          if (
            hospitalId &&
            doctorHospitalId &&
            hospitalId === doctorHospitalId
          ) {
            return true;
          }

          // Match by Hospital name
          if (
            hospitalName &&
            doctorHospitalName &&
            (
              hospitalName === doctorHospitalName ||
              hospitalName.includes(
                doctorHospitalName
              ) ||
              doctorHospitalName.includes(
                hospitalName
              )
            )
          ) {
            return true;
          }

          return false;
        }
      );

      // -----------------------------------------
      // Normalize appointments
      // -----------------------------------------
      const normalizedAppointments =
        allAppointments.map(
          normalizeBackendAppointment
        );

      // -----------------------------------------
      // Filter appointments for this hospital
      // -----------------------------------------
      const filteredAppointments =
        normalizedAppointments.filter(
          (appointment) => {
            const appointmentHospitalId =
              Number(
                appointment?.hospitalId || 0
              );

            const appointmentHospitalName =
              String(
                appointment?.hospitalName || ""
              )
                .trim()
                .toLowerCase();

            // Match Hospital ID
            if (
              hospitalId &&
              appointmentHospitalId &&
              hospitalId === appointmentHospitalId
            ) {
              return true;
            }

            // Match Hospital name
            if (
              hospitalName &&
              appointmentHospitalName &&
              (
                hospitalName ===
                appointmentHospitalName ||
                hospitalName.includes(
                  appointmentHospitalName
                ) ||
                appointmentHospitalName.includes(
                  hospitalName
                )
              )
            ) {
              return true;
            }

            return false;
          }
        );

      // -----------------------------------------
      // Extract unique patients
      // -----------------------------------------
      const patientIds = new Set();

      filteredAppointments.forEach(
        (appointment) => {
          if (appointment.patientId) {
            patientIds.add(
              String(appointment.patientId)
            );
          } else if (appointment.patientName) {
            patientIds.add(
              String(
                appointment.patientName
              )
                .toLowerCase()
                .trim()
            );
          }
        }
      );

      // Update state
      setDoctors(filteredDoctors);
      setAppointments(filteredAppointments);
      setPatients(Array.from(patientIds));
    } catch (err) {
      console.error(
        "Error loading hospital dashboard data:",
        err
      );

      setError(
        "Unable to connect to backend server. Please verify ASP.NET Core API is running."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Load dashboard on page open
  useEffect(() => {
    loadData();

    window.addEventListener(
      "medibook_appointments_updated",
      loadData
    );

    window.addEventListener(
      "medibook_hospitals_updated",
      loadData
    );

    return () => {
      window.removeEventListener(
        "medibook_appointments_updated",
        loadData
      );

      window.removeEventListener(
        "medibook_hospitals_updated",
        loadData
      );
    };
  }, [loadData]);

  // Check whether date is today
  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;

    const cleanDate = String(dateStr)
      .trim()
      .toLowerCase();

    if (cleanDate.includes("today")) {
      return true;
    }

    const today = new Date();

    const yyyy = today.getFullYear();

    const mm = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const dd = String(
      today.getDate()
    ).padStart(2, "0");

    const todayISO =
      `${yyyy}-${mm}-${dd}`;

    if (cleanDate === todayISO) {
      return true;
    }

    try {
      const parsedDate = new Date(dateStr);

      if (!Number.isNaN(parsedDate.getTime())) {
        return (
          parsedDate.getFullYear() ===
          today.getFullYear() &&
          parsedDate.getMonth() ===
          today.getMonth() &&
          parsedDate.getDate() ===
          today.getDate()
        );
      }
    } catch (error) {
      console.error(
        "Date parsing error:",
        error
      );
    }

    return false;
  };

  // Today's appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => {
        const status = String(
          appointment.status || ""
        )
          .trim()
          .toLowerCase();

        if (status === "cancelled") {
          return false;
        }

        return isTodayDate(
          appointment.date
        );
      }
    );
  }, [appointments]);

  // Upcoming appointments
  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => {
        const status = String(
          appointment.status || ""
        )
          .trim()
          .toLowerCase();

        return (
          status === "upcoming" ||
          status === "confirmed" ||
          status === "pending"
        );
      }
    );
  }, [appointments]);

  // Generate initials
  const getInitials = (name = "") => {
    if (!name) return "P";

    return String(name)
      .replace(/^dr\.\s+/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <main className="patient-dashboard-content">
      {/* Page Heading */}
      <section
        className="greeting-section"
        style={{ marginBottom: "24px" }}
      >
        <h2 className="greeting-title">
          Welcome back,{" "}
          {hospital?.name ||
            "MediCare Hospital"}
          !
        </h2>

        <p className="greeting-subtitle">
          Here is an overview of your
          hospital, doctors, appointments,
          and patients.
        </p>
      </section>

      {/* Loading */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: "12px"
          }}
        >
          <Loader2
            size={36}
            style={{
              color: "var(--primary)",
              animation:
                "spin 1s linear infinite"
            }}
          />

          <p
            style={{
              fontSize: "15px",
              fontWeight: "500",
              color: "var(--text-muted)",
              margin: 0
            }}
          >
            Loading hospital dashboard
            metrics...
          </p>
        </div>
      ) : error ? (
        /* Error */
        <EmptyState
          title="Failed to load dashboard metrics"
          description={error}
          icon={AlertCircle}
          actionLabel="Try Again"
          onAction={loadData}
        />
      ) : (
        <>
          {/* =========================================
              FOUR STATISTIC CARDS
          ========================================== */}
          <section className="admin-stats-grid">
            {/* Total Doctors */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">
                  Total Doctors
                </span>

                <div className="admin-stat-icon-wrapper">
                  <Stethoscope size={20} />
                </div>
              </div>

              <div className="admin-stat-number">
                {doctors.length}
              </div>

              <div className="admin-stat-divider" />

              <div className="admin-stat-subtext">
                Doctors registered under
                your hospital
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">
                  Today's Appointments
                </span>

                <div className="admin-stat-icon-wrapper">
                  <Calendar size={20} />
                </div>
              </div>

              <div className="admin-stat-number">
                {todayAppointments.length}
              </div>

              <div className="admin-stat-divider" />

              <div className="admin-stat-subtext">
                Appointments scheduled
                for today
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">
                  Upcoming Appointments
                </span>

                <div className="admin-stat-icon-wrapper">
                  <Clock size={20} />
                </div>
              </div>

              <div className="admin-stat-number">
                {upcomingAppointments.length}
              </div>

              <div className="admin-stat-divider" />

              <div className="admin-stat-subtext">
                Confirmed and pending
                appointments
              </div>
            </div>

            {/* Registered Patients */}
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <span className="admin-stat-label">
                  Registered Patients
                </span>

                <div className="admin-stat-icon-wrapper">
                  <Users size={20} />
                </div>
              </div>

              <div className="admin-stat-number">
                {patients.length}
              </div>

              <div className="admin-stat-divider" />

              <div className="admin-stat-subtext">
                Patients with appointments
                at your hospital
              </div>
            </div>
          </section>

          {/* =========================================
              TODAY'S APPOINTMENTS
          ========================================== */}
          <Card
            style={{
              marginBottom: "28px"
            }}
          >
            <div
              className="section-header"
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between"
              }}
            >
              <div>
                <h3
                  className="section-main-title"
                  style={{ margin: 0 }}
                >
                  Today's Appointments
                </h3>

                <p
                  style={{
                    fontSize: "13px",
                    color:
                      "var(--text-muted)",
                    margin:
                      "4px 0 0 0"
                  }}
                >
                  Scheduled appointments
                  preview for{" "}
                  {hospital?.name ||
                    "MediCare Hospital"}
                </p>
              </div>

              <button
                className="view-all-link"
                onClick={() =>
                  navigate(
                    "/hospital/appointments"
                  )
                }
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  color:
                    "var(--primary)",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                View All
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>DOCTOR</th>
                    <th>TIME</th>
                    <th>
                      REASON / TYPE
                    </th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {todayAppointments
                    .slice(0, 5)
                    .map((appointment) => (
                      <tr
                        key={
                          appointment.id
                        }
                      >
                        {/* Patient */}
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {getInitials(
                                appointment.patientName ||
                                "Patient"
                              )}
                            </div>

                            <div className="user-details">
                              <span className="user-name">
                                {appointment.patientName ||
                                  "Patient"}
                              </span>

                              <span className="user-subtext">
                                {appointment.patientId ||
                                  "P-101"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Doctor */}
                        <td>
                          <span
                            style={{
                              fontWeight:
                                "600",
                              color:
                                "var(--text-heading)"
                            }}
                          >
                            {appointment.doctorName ||
                              "Doctor"}
                          </span>
                        </td>

                        {/* Time */}
                        <td>
                          <span
                            style={{
                              fontWeight:
                                "600",
                              color:
                                "var(--primary)"
                            }}
                          >
                            {appointment.time ||
                              "10:30 AM"}
                          </span>
                        </td>

                        {/* Reason */}
                        <td>
                          <span
                            style={{
                              fontSize:
                                "13px",
                              color:
                                "var(--text-muted)"
                            }}
                          >
                            {appointment.type ||
                              appointment.specialty ||
                              "Consultation"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge
                            status={
                              appointment.status ||
                              "Confirmed"
                            }
                          />
                        </td>
                      </tr>
                    ))}

                  {todayAppointments.length ===
                    0 && (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              "center",
                            padding:
                              "32px 16px",
                            color:
                              "var(--text-muted)"
                          }}
                        >
                          No appointments
                          scheduled for today.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </main>
  );
}

export default HospitalDashboard;