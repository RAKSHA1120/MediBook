/* ==================================================
   Central Appointment Storage & Slot Key Utilities
   MediBook Patient Portal
   ================================================== */

export const APPOINTMENTS_STORAGE_KEY = "medibook_appointments";

// Initial default appointments if localStorage has no data
export const DEFAULT_APPOINTMENTS = [
  {
    id: "APT001",
    doctorId: 1,
    doctorName: "Dr. Emily Carter",
    specialty: "Cardiology",
    hospital: "MediCare Hospital",
    location: "Chennai",
    consultationFee: 800,
    patientId: "P1",
    patientName: "Patient",
    patientContact: "9876543210",
    date: "2026-08-26",
    formattedDate: "Wednesday, Aug 26, 2026",
    time: "10:00 AM",
    status: "confirmed",
    createdAt: "2026-08-20T10:00:00.000Z"
  },
  {
    id: "APT002",
    doctorId: 2,
    doctorName: "Dr. Rajesh Kumar",
    specialty: "Dermatology",
    hospital: "Apollo Hospital",
    location: "Chennai",
    consultationFee: 700,
    patientId: "P1",
    patientName: "Patient",
    patientContact: "9876543210",
    date: "2026-08-20",
    formattedDate: "Thursday, Aug 20, 2026",
    time: "02:30 PM",
    status: "completed",
    createdAt: "2026-08-15T14:30:00.000Z"
  },
  {
    id: "APT003",
    doctorId: 3,
    doctorName: "Dr. Meena Raj",
    specialty: "Neurology",
    hospital: "Fortis Healthcare",
    location: "Chennai",
    consultationFee: 900,
    patientId: "P1",
    patientName: "Patient",
    patientContact: "9876543210",
    date: "2026-08-15",
    formattedDate: "Saturday, Aug 15, 2026",
    time: "11:00 AM",
    status: "cancelled",
    createdAt: "2026-08-10T11:00:00.000Z"
  }
];

/**
 * Generates a consistent, unique key for an appointment slot.
 * Format: doctorId_YYYY-MM-DD_time
 */
export const getSlotKey = (doctorId, date, time) => {
  const normDoc = String(doctorId || "").trim();
  const normDate = String(date || "").trim();
  const normTime = String(time || "").trim();
  return `${normDoc}_${normDate}_${normTime}`;
};

/**
 * Standardizes appointment status string.
 * Returns: "confirmed" | "completed" | "cancelled"
 */
export const normalizeStatus = (status) => {
  if (!status) return "confirmed";
  const s = String(status).toLowerCase().trim();
  if (s === "cancelled") return "cancelled";
  if (s === "completed") return "completed";
  if (s === "upcoming" || s === "confirmed" || s === "scheduled") return "confirmed";
  return "confirmed";
};

/**
 * Reads stored appointments from localStorage.
 * Initializes from DEFAULT_APPOINTMENTS if empty.
 */
export const getStoredAppointments = () => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading medibook_appointments from localStorage:", e);
  }

  // Save and return defaults if no stored appointments exist
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_APPOINTMENTS));
  } catch (e) {}
  return DEFAULT_APPOINTMENTS;
};

/**
 * Saves appointments array to localStorage and dispatches a window event.
 */
export const saveStoredAppointments = (appointments) => {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error("Error saving medibook_appointments to localStorage:", e);
  }
  window.dispatchEvent(new Event("medibook_appointments_updated"));
};

/**
 * Normalizes time string to standard format (e.g. "9:00 AM" -> "09:00 AM")
 */
export const normalizeTime = (timeStr) => {
  if (!timeStr) return "";
  let t = String(timeStr).trim().toUpperCase();
  if (/^\d:\d{2}\s*(AM|PM)$/.test(t)) {
    t = "0" + t;
  }
  return t;
};

/**
 * Checks if two doctor references match by ID or Name
 */
export const isSameDoctor = (docAId, docAName, docBId, docBName) => {
  const normIdA = String(docAId ?? "").trim().toLowerCase();
  const normIdB = String(docBId ?? "").trim().toLowerCase();
  if (normIdA && normIdB && normIdA === normIdB) return true;

  const normNameA = String(docAName ?? "").trim().toLowerCase().replace(/^dr\.\s+/i, "");
  const normNameB = String(docBName ?? "").trim().toLowerCase().replace(/^dr\.\s+/i, "");
  if (normNameA && normNameB && normNameA === normNameB) return true;

  return false;
};

/**
 * Checks if a specific time slot is booked by an active (non-cancelled, non-completed) appointment.
 * Optionally excludes an appointment currently being rescheduled.
 */
export const checkIsSlotBooked = (appointments, doctorId, date, time, excludeAppointmentId = null, doctorName = null) => {
  if (!date || !time || !Array.isArray(appointments)) return false;
  const targetDate = String(date).trim();
  const targetTime = normalizeTime(time);
  const excludeIdStr = excludeAppointmentId ? String(excludeAppointmentId).trim().toLowerCase() : null;

  return appointments.some((appt) => {
    if (!appt || !appt.date || !appt.time) return false;

    // 1. Exclude the appointment currently being rescheduled
    if (excludeIdStr && String(appt.id ?? "").trim().toLowerCase() === excludeIdStr) {
      return false;
    }

    // 2. Only active/upcoming/confirmed appointments block slots. Cancelled and Completed do NOT block.
    const normStatus = normalizeStatus(appt.status);
    if (normStatus === "cancelled" || normStatus === "completed") {
      return false;
    }

    // 3. Match Date
    if (String(appt.date).trim() !== targetDate) {
      return false;
    }

    // 4. Match Time
    if (normalizeTime(appt.time) !== targetTime) {
      return false;
    }

    // 5. Match Doctor (by ID or Name)
    const apptDocId = appt.doctorId;
    const apptDocName = appt.doctorName || appt.doctor;
    if (doctorId || doctorName) {
      return isSameDoctor(apptDocId, apptDocName, doctorId, doctorName);
    }

    return true;
  });
};
