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
 * Checks if a specific time slot is booked by an active (non-cancelled) appointment.
 */
export const checkIsSlotBooked = (appointments, doctorId, date, time) => {
  if (!doctorId || !date || !time || !Array.isArray(appointments)) return false;
  const targetKey = getSlotKey(doctorId, date, time);

  return appointments.some((appt) => {
    if (!appt || !appt.doctorId || !appt.date || !appt.time) return false;
    const status = normalizeStatus(appt.status);
    if (status === "cancelled") return false; // Cancelled appointments release the slot!
    const key = getSlotKey(appt.doctorId, appt.date, appt.time);
    return key === targetKey;
  });
};
