import { useState, useEffect, useCallback } from "react";
import { Clock, Plus, Trash2, CalendarClock, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";
import Card from "../components/Card";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import "../pages/AdminShared.css";

function DoctorSchedule() {
  const [schedule, setSchedule] = useState({
    Monday: ["09:00 AM - 01:00 PM"],
    Tuesday: ["09:00 AM - 01:00 PM"],
    Wednesday: ["09:00 AM - 01:00 PM"],
    Thursday: ["09:00 AM - 01:00 PM"],
    Friday: ["09:00 AM - 01:00 PM"],
    Saturday: [],
    Sunday: []
  });

  const [newSlot, setNewSlot] = useState({ day: "Monday", start: "09:00", end: "13:00" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const formatTimeSpan = (ts) => {
    if (!ts) return "09:00 AM";
    const str = String(ts);
    const parts = str.split(":");
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
    }
    return ts;
  };

  const loadDoctorSchedule = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    const rawDocId = user?.doctorId || doc?.id || user?.refId || user?.id;
    const docIdInt = rawDocId || "";

    if (!docIdInt) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5107/api/DoctorSchedules/doctor/${docIdInt}`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const weeklyMap = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: []
        };

        data.forEach((item) => {
          if (item.isAvailable && item.dayOfWeek) {
            const dayKey = item.dayOfWeek.trim();
            const startFmt = formatTimeSpan(item.startTime);
            const endFmt = formatTimeSpan(item.endTime);
            const slotStr = `${startFmt} - ${endFmt}`;
            if (weeklyMap[dayKey] && !weeklyMap[dayKey].includes(slotStr)) {
              weeklyMap[dayKey].push(slotStr);
            }
          }
        });

        setSchedule(weeklyMap);
      } else {
        // Fallback to local user schedule if database returns empty
        const userKey = user?.refId || user?.id || docIdInt;
        const savedSchedule = localStorage.getItem(`medibook_schedule_${userKey}`);
        if (savedSchedule) {
          try {
            setSchedule(JSON.parse(savedSchedule));
          } catch (e) {
            console.error("Failed to parse saved doctor schedule", e);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching backend doctor schedule:", err);
      setApiError("Unable to fetch doctor schedule from backend API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctorSchedule();
  }, [loadDoctorSchedule]);

  const showToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(msg);
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setErrorMessage(msg);
      setSuccessMessage("");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const handleSave = () => {
    const user = getCurrentUser();
    const doc = getCurrentDoctor();
    const userKey = doc?.id ?? user?.refId ?? user?.id ?? 1;
    localStorage.setItem(`medibook_schedule_${userKey}`, JSON.stringify(schedule));
    showToast("Schedule saved locally! (Backend PUT/POST endpoint missing for persistence)", true);
  };

  const addSlot = (e) => {
    if (e) e.preventDefault();

    if (!newSlot.start || !newSlot.end) {
      showToast("Please specify both start and end times.", false);
      return;
    }

    if (newSlot.start >= newSlot.end) {
      showToast("Start time must be earlier than end time.", false);
      return;
    }

    const formatTime = (time24) => {
      const [hours, minutes] = time24.split(":");
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    };

    const slotString = `${formatTime(newSlot.start)} - ${formatTime(newSlot.end)}`;
    const currentSlots = schedule[newSlot.day] || [];

    if (currentSlots.includes(slotString)) {
      showToast(`This time slot (${slotString}) already exists for ${newSlot.day}.`, false);
      return;
    }

    setSchedule((prev) => ({
      ...prev,
      [newSlot.day]: [...(prev[newSlot.day] || []), slotString]
    }));

    showToast(`Added ${slotString} to ${newSlot.day}.`, true);
  };

  const removeSlot = (day, index) => {
    setSchedule((prev) => {
      const updatedDay = [...(prev[day] || [])];
      updatedDay.splice(index, 1);
      return { ...prev, [day]: updatedDay };
    });
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <main className="patient-dashboard-content">
      {/* 1. Page Header */}
      <section className="greeting-section" style={{ marginBottom: "20px" }}>
        <h2 className="greeting-title">My Schedule</h2>
        <p className="greeting-subtitle">Manage your weekly availability and time slots.</p>
      </section>

      {/* Toast Feedback Banners */}
      {successMessage && (
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
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
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
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
          <Loader2 size={36} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-muted)", margin: 0 }}>
            Loading doctor schedule...
          </p>
        </div>
      ) : apiError ? (
        <EmptyState
          title="Failed to load schedule"
          description={apiError}
          icon={AlertCircle}
          actionLabel="Try Again"
          onAction={loadDoctorSchedule}
        />
      ) : (
        /* 2. Responsive 2-Column Grid Layout */
        <div
          className="schedule-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            alignItems: "start"
          }}
        >
          {/* LEFT COLUMN: Add New Time Slot Card + Save Button */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Card>
              <h3
                style={{
                  margin: "0 0 20px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--text-heading)"
                }}
              >
                <CalendarClock size={22} style={{ color: "var(--primary)" }} /> Add New Time Slot
              </h3>

              <form onSubmit={addSlot} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Day of Week */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-muted)",
                      marginBottom: "6px"
                    }}
                  >
                    Day of Week
                  </label>
                  <select
                    className="form-select"
                    style={{ height: "44px", width: "100%", borderRadius: "8px" }}
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start & End Times Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        marginBottom: "6px"
                      }}
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ height: "44px", width: "100%", borderRadius: "8px" }}
                      value={newSlot.start}
                      onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        marginBottom: "6px"
                      }}
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ height: "44px", width: "100%", borderRadius: "8px" }}
                      value={newSlot.end}
                      onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                    />
                  </div>
                </div>

                {/* Add Slot Button */}
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    height: "44px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: "600",
                    marginTop: "4px"
                  }}
                >
                  <Plus size={18} /> Add Slot
                </Button>
              </form>
            </Card>

            {/* Save Button Container */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="primary"
                onClick={handleSave}
                style={{
                  height: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600"
                }}
              >
                <Save size={18} /> Save Schedule to Profile
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Weekly Overview Card */}
          <div>
            <Card>
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--text-heading)"
                }}
              >
                Weekly Overview
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {days.map((day, idx) => {
                  const slots = schedule[day] || [];
                  const isLast = idx === days.length - 1;

                  return (
                    <div
                      key={day}
                      style={{
                        paddingBottom: isLast ? "0" : "16px",
                        borderBottom: isLast ? "none" : "1px solid var(--border)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-heading)" }}>
                          {day}
                        </span>
                        {slots.length === 0 && (
                          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                            Not Available / Off
                          </span>
                        )}
                      </div>

                      {slots.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {slots.map((slot, slotIdx) => (
                            <div
                              key={slotIdx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 12px",
                                backgroundColor: "var(--primary-soft)",
                                border: "1px solid var(--primary-light)",
                                borderRadius: "20px",
                                fontSize: "13.5px",
                                fontWeight: "600",
                                color: "var(--primary-dark)"
                              }}
                            >
                              <Clock size={14} style={{ color: "var(--primary)" }} />
                              <span>{slot}</span>
                              <button
                                type="button"
                                onClick={() => removeSlot(day, slotIdx)}
                                title="Remove time slot"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#ef4444",
                                  padding: "2px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  borderRadius: "4px",
                                  transition: "background 0.2s"
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}

export default DoctorSchedule;
