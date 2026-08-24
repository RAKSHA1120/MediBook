/* ==================================================
   MediBook Notifications Data & State Management
   ================================================== */

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    type: "reminder",
    subType: "reminder",
    title: "Upcoming Appointment Reminder",
    message: "You have an appointment with Dr. Emily Carter on August 26, 2026 at 10:30 AM.",
    createdAt: "August 25, 2026 • 9:00 AM",
    timestamp: Date.now() - 3600000 * 2,
    read: false,
    appointmentId: "APT-1001"
  },
  {
    id: "notif-002",
    type: "appointment",
    subType: "confirmed",
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Priya Sharma on August 28, 2026 at 10:00 AM has been confirmed.",
    createdAt: "August 24, 2026 • 2:15 PM",
    timestamp: Date.now() - 3600000 * 24,
    read: false,
    appointmentId: "APT001"
  },
  {
    id: "notif-003",
    type: "reminder",
    subType: "reminder",
    title: "Appointment Tomorrow",
    message: "Reminder: Your consultation with Dr. Arun Kumar is scheduled for tomorrow at 2:30 PM.",
    createdAt: "August 24, 2026 • 8:30 AM",
    timestamp: Date.now() - 3600000 * 30,
    read: false,
    appointmentId: "APT002"
  },
  {
    id: "notif-004",
    type: "system",
    subType: "system",
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
  }
];

const STORAGE_KEY = "medibook_notifications";

export const getStoredNotifications = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading notifications from localStorage:", e);
  }
  return INITIAL_NOTIFICATIONS;
};

export const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
  } catch (e) {
    console.error("Error saving notifications to localStorage:", e);
  }
};

export const markNotificationAsRead = (id) => {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  return updated;
};

export const markAllNotificationsAsRead = () => {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
};

export const addNotification = (notification) => {
  const current = getStoredNotifications();
  const newNotif = {
    id: `notif-${Date.now()}`,
    createdAt: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }),
    timestamp: Date.now(),
    read: false,
    ...notification
  };
  const updated = [newNotif, ...current];
  saveNotifications(updated);
  return updated;
};

export const getUnreadCount = () => {
  const notifications = getStoredNotifications();
  return notifications.filter((n) => !n.read).length;
};
