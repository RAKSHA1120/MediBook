/* ==================================================
   MediBook Notifications Data & State Management
   ================================================== */

export const INITIAL_NOTIFICATIONS = [];

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
