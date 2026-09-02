export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    type: "reminder",
    subType: "reminder",
    patientId: "P1",
    userId: "U_P1",
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
    patientId: "P1",
    userId: "U_P1",
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
    patientId: "P1",
    userId: "U_P1",
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
    patientId: "P1",
    userId: "U_P1",
    title: "Welcome to MediBook",
    message: "Explore top medical specialists, schedule visits, and manage your health records effortlessly.",
    createdAt: "August 20, 2026 • 10:00 AM",
    timestamp: Date.now() - 3600000 * 120,
    read: true
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
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
};

export const addNotification = (notif) => {
  try {
    const current = getStoredNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      createdAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }),
      timestamp: Date.now(),
      read: false,
      ...notif
    };
    const updated = [newNotif, ...current];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
};

export const markNotificationAsRead = (id) => {
  try {
    const current = getStoredNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
};

export const markAllNotificationsAsRead = () => {
  try {
    const current = getStoredNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("medibook_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
};

export const getUnreadCount = () => {
  try {
    const list = getStoredNotifications();
    return list.filter((n) => !n.read).length;
  } catch (e) {
    return 0;
  }
};
