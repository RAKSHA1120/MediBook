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

export const NOTIFICATIONS_STORAGE_KEY = "medibook_notifications_deprecated";

import { api } from "../utils/api";
import { getCurrentUser } from "../utils/auth";

// Temporary backward compatibility wrapper if sync calls are made
export const getStoredNotifications = () => {
  return [];
};

export const resolveDoctorIdForNotification = (n) => null;

export const addNotification = async (notif) => {
  try {
    const user = getCurrentUser();
    let fallbackPId = 0;
    let fallbackUId = user?.id || 0;

    const newNotif = {
      UserId: notif.userId || fallbackUId,
      Type: notif.type || "system",
      Title: notif.title || "Notification",
      Message: notif.message || "",
      IsRead: false
    };

    const res = await api.post("/Notifications", newNotif);
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return [res.data];
  } catch (e) {
    console.error("Error adding notification via API:", e);
    return [];
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    await api.put(`/Notifications/${id}/read`);
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return [];
  } catch (e) {
    console.error("Error marking read via API:", e);
    return [];
  }
};

// Map backend notification to frontend contract
const mapApiNotification = (n) => ({
  id: n.id,
  userId: n.userId,
  type: n.type,
  title: n.title,
  message: n.message,
  read: n.isRead,
  isRead: n.isRead,
  createdAt: new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
  timestamp: new Date(n.createdAt).getTime()
});

export const markAllNotificationsAsRead = async (patientId, userId) => {
  try {
    const notifs = await getPatientNotifications(patientId, userId);
    for (const n of notifs) {
      if (!n.read) {
         await api.put(`/Notifications/${n.id}/read`);
      }
    }
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return [];
  } catch (e) {
    return [];
  }
};

export const markAllDoctorNotificationsAsRead = async (doctorId, userId) => {
  try {
    const notifs = await getDoctorNotifications(doctorId, userId);
    for (const n of notifs) {
      if (!n.read) {
         await api.put(`/Notifications/${n.id}/read`);
      }
    }
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return [];
  } catch (e) {
    return [];
  }
};

export const getPatientNotifications = async (patientId, userId) => {
  try {
    const uId = userId || getCurrentUser()?.id;
    if (!uId) return [];
    const res = await api.get(`/Notifications/user/${uId}`);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(mapApiNotification);
    }
    return [];
  } catch(e) {
    return [];
  }
};

export const getDoctorNotifications = async (doctorId, userId) => {
  try {
    const uId = userId || getCurrentUser()?.id;
    if (!uId) return [];
    const res = await api.get(`/Notifications/user/${uId}`);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map(mapApiNotification);
    }
    return [];
  } catch(e) {
    return [];
  }
};

export const getUnreadCount = async (patientId, userId) => {
  try {
    const list = await getPatientNotifications(patientId, userId);
    return list.filter((n) => !n.read).length;
  } catch (e) {
    return 0;
  }
};

export const clearAllNotifications = async (patientId, userId) => {
  try {
    const notifs = await getPatientNotifications(patientId, userId);
    for (const n of notifs) {
      await api.delete(`/Notifications/${n.id}`);
    }
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return [];
  } catch (e) {
    return [];
  }
};
