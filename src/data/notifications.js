/* ==================================================
   MediBook Notifications Data & State Management
   ================================================== */
import doctors from "./doctors";

export const INITIAL_NOTIFICATIONS = [
  // Patient Notifications (also tagged with doctorId where applicable)
  {
    id: "notif-001",
    type: "reminder",
    subType: "reminder",
    patientId: "P1",
    userId: "U_P1",
    doctorId: "1", // Dr. Emily Carter
    title: "Upcoming Appointment Reminder",
    message: "You have an appointment with Dr. Emily Carter on August 26, 2026 at 10:30 AM.",
    createdAt: "August 25, 2026 • 9:00 AM",
    timestamp: Date.now() - 3600000 * 2,
    read: false,
    appointmentId: "APT001"
  },
  {
    id: "notif-002",
    type: "appointment",
    subType: "confirmed",
    patientId: "P1",
    userId: "U_P1",
    doctorId: "D1", // Dr. Sarah Smith
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Sarah Smith on September 2, 2026 at 09:30 AM has been confirmed.",
    createdAt: "August 24, 2026 • 2:15 PM",
    timestamp: Date.now() - 3600000 * 24,
    read: false,
    appointmentId: "APT001"
  },
  {
    id: "notif-003",
    type: "reminder",
    subType: "reminder",
    patientId: "P1",
    userId: "U_P1",
    doctorId: "4", // Dr. Rajesh Kumar
    title: "Appointment Tomorrow",
    message: "Reminder: Your consultation with Dr. Rajesh Kumar is scheduled for tomorrow at 2:30 PM.",
    createdAt: "August 24, 2026 • 8:30 AM",
    timestamp: Date.now() - 3600000 * 30,
    read: false,
    appointmentId: "APT002"
  },
  {
    id: "notif-004",
    type: "system",
    subType: "system",
    patientId: "P1",
    userId: "U_P1",
    title: "Profile Updated",
    message: "Your personal medical profile details were successfully updated.",
    createdAt: "August 23, 2026 • 4:45 PM",
    timestamp: Date.now() - 3600000 * 48,
    read: true
  },
  {
    id: "notif-005",
    type: "appointment",
    subType: "rescheduled",
    patientId: "P1",
    userId: "U_P1",
    title: "Appointment Rescheduled",
    message: "Your appointment with Dr. Meena Raj has been rescheduled to August 30, 2026 at 11:00 AM.",
    createdAt: "August 22, 2026 • 11:20 AM",
    timestamp: Date.now() - 3600000 * 72,
    read: true,
    appointmentId: "APT003"
  },
  {
    id: "notif-006",
    type: "system",
    subType: "system",
    title: "Welcome to MediBook",
    message: "Explore top medical specialists, schedule visits, and manage your health records effortlessly.",
    createdAt: "August 20, 2026 • 10:00 AM",
    timestamp: Date.now() - 3600000 * 120,
    read: true
  },

  // Doctor Specific Notifications
  {
    id: "doc-notif-001",
    type: "appointment",
    subType: "confirmed",
    targetRole: "doctor",
    doctorId: "D1",
    doctorName: "Dr. Sarah Smith",
    title: "New Patient Consultation",
    message: "Patient Rahul Sharma booked a consultation for Cardiology on Sep 2, 2026 at 09:30 AM.",
    createdAt: "August 25, 2026 • 9:00 AM",
    timestamp: Date.now() - 3600000 * 2,
    read: false,
    appointmentId: "APT001"
  },
  {
    id: "doc-notif-002",
    type: "system",
    targetRole: "doctor",
    doctorId: "D1",
    doctorName: "Dr. Sarah Smith",
    title: "Schedule Updated",
    message: "Your weekly consultation availability for City Heart Center has been updated.",
    createdAt: "August 24, 2026 • 10:00 AM",
    timestamp: Date.now() - 3600000 * 24,
    read: false
  },
  {
    id: "doc-notif-003",
    type: "appointment",
    subType: "confirmed",
    targetRole: "doctor",
    doctorId: "1",
    doctorName: "Dr. Emily Carter",
    title: "New Patient Consultation",
    message: "Patient Priya Patel booked a consultation for Cardiology on Sep 3, 2026 at 11:00 AM.",
    createdAt: "August 25, 2026 • 11:00 AM",
    timestamp: Date.now() - 3600000 * 3,
    read: false,
    appointmentId: "APT002"
  },
  {
    id: "doc-notif-004",
    type: "appointment",
    subType: "confirmed",
    targetRole: "doctor",
    doctorId: "D3",
    doctorName: "Dr. Arun Kumar",
    title: "New Patient Consultation",
    message: "Patient Vikram Malhotra booked a consultation for Neurology on Sep 4, 2026 at 02:30 PM.",
    createdAt: "August 25, 2026 • 2:00 PM",
    timestamp: Date.now() - 3600000 * 4,
    read: false,
    appointmentId: "APT003"
  }
];

export const NOTIFICATIONS_STORAGE_KEY = "medibook_notifications";

export const getStoredNotifications = () => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure seed doctor notifications exist if user has older localStorage state
      const hasDocNotif = parsed.some((n) => n.id && String(n.id).startsWith("doc-notif-"));
      if (!hasDocNotif) {
        const merged = [...parsed, ...INITIAL_NOTIFICATIONS.filter((n) => String(n.id).startsWith("doc-notif-"))];
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading medibook_notifications from localStorage:", e);
  }

  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  } catch (e) {}
  return INITIAL_NOTIFICATIONS;
};

// Helper: Resolve Doctor ID from explicit field, appointment mapping, or doctor name in message text
export const resolveDoctorIdForNotification = (n) => {
  if (!n) return null;

  if (n.doctorId) return String(n.doctorId);

  // Check appointmentId if present
  if (n.appointmentId) {
    try {
      const aptsStr = localStorage.getItem("medibook_appointments");
      if (aptsStr) {
        const apts = JSON.parse(aptsStr);
        const apt = apts.find((a) => String(a.id || "").toLowerCase() === String(n.appointmentId).toLowerCase());
        if (apt && apt.doctorId) {
          return String(apt.doctorId);
        }
      }
    } catch (e) {}
  }

  // Check doctor name in title / message
  const text = `${n.title || ""} ${n.message || ""}`.toLowerCase();
  for (const doc of doctors) {
    if (!doc || !doc.name) continue;
    const cleanName = doc.name.replace(/^dr\.\s+/i, "").toLowerCase().trim();
    if (cleanName.length > 2 && text.includes(cleanName)) {
      return String(doc.id);
    }
  }

  return null;
};

export const addNotification = (notif) => {
  try {
    const current = getStoredNotifications();

    let fallbackPId = "P1";
    let fallbackUId = "U_P1";
    try {
      const userStr = localStorage.getItem("medibook_current_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u && u.role === "patient") {
          fallbackPId = u.refId || u.id || "P1";
          fallbackUId = u.id || "U_P1";
        }
      }
    } catch (e) {}

    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
      timestamp: Date.now(),
      read: false,
      ...(notif.targetRole !== "doctor" && !notif.doctorId ? { patientId: notif.patientId || fallbackPId, userId: notif.userId || fallbackUId } : {}),
      ...notif
    };

    const updated = [newNotif, ...current];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    console.error("Error adding notification:", e);
    return [];
  }
};

export const markNotificationAsRead = (id) => {
  try {
    const current = getStoredNotifications();
    const targetIdStr = String(id ?? "").trim().toLowerCase();
    const updated = current.map((n) => (String(n.id ?? "").trim().toLowerCase() === targetIdStr ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
};

export const markAllNotificationsAsRead = (patientId, userId) => {
  try {
    const current = getStoredNotifications();
    let normPId = String(patientId || "").trim().toLowerCase();
    let normUId = String(userId || "").trim().toLowerCase();

    if (!normPId && !normUId) {
      normPId = "p1";
      normUId = "u_p1";
    }

    const updated = current.map((n) => {
      const nPId = String(n.patientId || "").trim().toLowerCase();
      const nUId = String(n.userId || "").trim().toLowerCase();

      const matchesPatient = (nPId && normPId && (nPId === normPId || (normPId === "p1" && nPId === "p_1") || (normPId === "p_1" && nPId === "p1"))) ||
                             (nUId && normUId && nUId === normUId) ||
                             (!nPId && !nUId && (normPId === "p1" || normPId === "p_1"));

      if (matchesPatient && !n.doctorId && n.targetRole !== "doctor") {
        return { ...n, read: true };
      }
      return n;
    });

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
};

export const markAllDoctorNotificationsAsRead = (doctorId, userId) => {
  try {
    const notifications = getStoredNotifications();
    const userStr = localStorage.getItem("medibook_current_user");
    let currentUser = null;
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {}
    }

    const targetDocId = String(doctorId || currentUser?.refId || currentUser?.id || "D1").trim().toLowerCase();

    const updated = notifications.map((n) => {
      if (!n) return n;

      const resolvedDocId = resolveDoctorIdForNotification(n);

      let matchesTargetDoc = false;
      if (resolvedDocId) {
        const normResolved = String(resolvedDocId).trim().toLowerCase();
        matchesTargetDoc =
          normResolved === targetDocId ||
          `doc-${normResolved}` === targetDocId ||
          `d${normResolved}` === targetDocId ||
          normResolved === `doc-${targetDocId}` ||
          normResolved === `d${targetDocId}` ||
          (targetDocId === "d1" && (normResolved === "d1" || normResolved === "1" || normResolved === "doc-001")) ||
          (targetDocId === "1" && (normResolved === "d1" || normResolved === "1" || normResolved === "doc-001"));
      } else if (n.type === "system" && !n.patientId) {
        matchesTargetDoc = true;
      }

      if (matchesTargetDoc) {
        return { ...n, read: true };
      }
      return n;
    });

    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
};

export const getPatientNotifications = (patientId, userId) => {
  const notifications = getStoredNotifications();
  let normPId = String(patientId || "").trim().toLowerCase();
  let normUId = String(userId || "").trim().toLowerCase();

  if (!normPId && !normUId) {
    normPId = "p1";
    normUId = "u_p1";
  }

  return notifications.filter((n) => {
    if (!n) return false;

    // Exclude doctor-targeted notifications from patient view
    if (n.doctorId || n.targetRole === "doctor") {
      return false;
    }

    const nPId = String(n.patientId || "").trim().toLowerCase();
    const nUId = String(n.userId || "").trim().toLowerCase();

    if (!nPId && !nUId) {
      if (normPId === "p1" || normPId === "p_1") return true;
      return false;
    }

    if (nPId && normPId && (nPId === normPId || (normPId === "p1" && nPId === "p_1") || (normPId === "p_1" && nPId === "p1"))) return true;
    if (nUId && normUId && nUId === normUId) return true;

    if (normPId === "p1" || normPId === "p_1") {
      if (nPId === "p1" || nPId === "p_1" || nUId === "u_p1") return true;
    }

    return false;
  });
};

export const getDoctorNotifications = (doctorId, userId) => {
  const notifications = getStoredNotifications();
  const userStr = localStorage.getItem("medibook_current_user");
  let currentUser = null;
  if (userStr) {
    try {
      currentUser = JSON.parse(userStr);
    } catch (e) {}
  }

  const targetDocId = String(doctorId || currentUser?.refId || currentUser?.id || "D1").trim().toLowerCase();

  return notifications.filter((n) => {
    if (!n) return false;

    const resolvedDocId = resolveDoctorIdForNotification(n);

    if (resolvedDocId) {
      const normResolved = String(resolvedDocId).trim().toLowerCase();
      if (
        normResolved === targetDocId ||
        `doc-${normResolved}` === targetDocId ||
        `d${normResolved}` === targetDocId ||
        normResolved === `doc-${targetDocId}` ||
        normResolved === `d${targetDocId}` ||
        (targetDocId === "d1" && (normResolved === "d1" || normResolved === "1" || normResolved === "doc-001")) ||
        (targetDocId === "1" && (normResolved === "d1" || normResolved === "1" || normResolved === "doc-001"))
      ) {
        return true;
      }
      return false; // Belongs to another doctor
    }

    // Exclude patient-specific notifications from doctor view
    if (n.patientId) {
      return false;
    }

    // Include system-wide notifications that are not patient-specific
    if (n.type === "system" || !n.patientId) {
      return true;
    }

    return false;
  });
};

export const getUnreadCount = (patientId, userId) => {
  try {
    const list = getPatientNotifications(patientId, userId);
    return list.filter((n) => !n.read).length;
  } catch (e) {
    return 0;
  }
};

export const clearAllNotifications = () => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return [];
  } catch (e) {
    return [];
  }
};
