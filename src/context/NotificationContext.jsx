import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { notificationHub } from "../services/notificationHub";
import { getCurrentUser } from "../utils/auth";
import { api } from "../utils/api";
import Toast from "../components/Toast";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearAll: async () => {},
  showToast: () => {},
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const activeUserRef = useRef(null);
  const notificationsRef = useRef([]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = "info", duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep at most 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const fetchNotifications = useCallback(async () => {
    const user = getCurrentUser();
    if (!user || !user.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const endpoint = `/Notifications/user/${user.id}`;
      const res = await api.get(endpoint);

      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((n) => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type || "appointment",
          subType: n.subType,
          appointmentId: n.appointmentId,
          read: Boolean(n.isRead),
          isRead: Boolean(n.isRead),
          createdAt: n.createdAt,
          timestamp: n.createdAt,
        }));

        setNotifications(mapped);
        const unread = Math.max(0, mapped.filter((n) => !n.isRead && !n.read).length);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch notifications:", err);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const res = await api.put(`/Notifications/${id}/read`);
      if (!res.success) {
        throw new Error(res.error || "Failed to mark notification as read");
      }
      setNotifications((prev) => {
        const next = prev.map((n) =>
          n.id === id ? { ...n, isRead: true, read: true } : n
        );
        const count = Math.max(0, next.filter((n) => !n.isRead && !n.read).length);
        setUnreadCount(count);
        return next;
      });
      window.dispatchEvent(new Event("medibook_notifications_updated"));
    } catch (err) {
      console.warn("[NotificationContext] Failed to mark notification as read:", err);
      showToast({
        title: "Error",
        message: "Failed to mark notification as read.",
        type: "error",
      });
    }
  }, [showToast]);

  const markAllAsRead = useCallback(async () => {
    // 1. Snapshot currently unread IDs at the time action begins
    const unreadSnapshot = notificationsRef.current.filter((n) => !n.isRead && !n.read);
    const unreadIds = unreadSnapshot.map((n) => n.id);

    if (unreadIds.length === 0) {
      return { success: true, count: 0 };
    }

    // 2. Mark each unread notification using existing PUT /api/Notifications/{id}/read
    const results = await Promise.allSettled(
      unreadIds.map(async (id) => {
        const res = await api.put(`/Notifications/${id}/read`);
        if (!res.success) {
          throw new Error(res.error || `Failed to mark notification ${id} as read`);
        }
        return id;
      })
    );

    const succeededIds = new Set();
    let failedCount = 0;

    results.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        succeededIds.add(unreadIds[idx]);
      } else {
        failedCount++;
        console.error(`[NotificationContext] Failed to mark notification ${unreadIds[idx]} as read:`, r.reason);
      }
    });

    // 3. Functional state update based on latest state (prev)
    // Any SignalR notification received while markAllAsRead was executing is in prev,
    // and will NOT be in succeededIds, so it remains untouched and unread.
    setNotifications((prev) => {
      const next = prev.map((n) =>
        succeededIds.has(n.id) ? { ...n, isRead: true, read: true } : n
      );
      // Derive unreadCount directly from the resulting state, ensuring it never goes negative
      const newUnreadCount = Math.max(0, next.filter((n) => !n.isRead && !n.read).length);
      setUnreadCount(newUnreadCount);
      return next;
    });

    // 4. Dispatch event for any other external components
    window.dispatchEvent(new Event("medibook_notifications_updated"));

    // 5. Toast feedback
    if (failedCount > 0) {
      showToast({
        title: "Error",
        message: `Failed to mark ${failedCount} notification${failedCount > 1 ? "s" : ""} as read.`,
        type: "error",
      });
      return { success: false, succeededCount: succeededIds.size, failedCount };
    } else {
      showToast({
        title: "Success",
        message: "All notifications marked as read.",
        type: "success",
      });
      return { success: true, succeededCount: succeededIds.size, failedCount: 0 };
    }
  }, [showToast]);

  const clearAll = useCallback(async () => {
    const toDelete = [...notificationsRef.current];
    setNotifications([]);
    setUnreadCount(0);
    await Promise.allSettled(
      toDelete.map((item) => api.delete(`/Notifications/${item.id}`))
    );
    window.dispatchEvent(new Event("medibook_notifications_updated"));
  }, []);

  // Connect to SignalR when logged in, disconnect on logout
  useEffect(() => {
    const syncConnection = async () => {
      const user = getCurrentUser();
      const userId = user?.id;

      if (userId) {
        activeUserRef.current = userId;
        await notificationHub.startConnection(userId);
        await fetchNotifications();
      } else {
        activeUserRef.current = null;
        await notificationHub.stopConnection();
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    syncConnection();

    // Re-sync on auth changes
    const handleAuthChange = () => syncConnection();
    window.addEventListener("medibook_current_user_updated", handleAuthChange);

    return () => {
      window.removeEventListener("medibook_current_user_updated", handleAuthChange);
      notificationHub.stopConnection();
    };
  }, [fetchNotifications]);

  // Handle incoming real-time notifications via SignalR
  useEffect(() => {
    const unsubscribe = notificationHub.onNotificationReceived((incoming) => {
      if (!incoming) return;

      const normalized = {
        id: incoming.id || Date.now(),
        userId: incoming.userId,
        title: incoming.title || "New Notification",
        message: incoming.message || "",
        type: incoming.type || "appointment",
        subType: incoming.subType,
        appointmentId: incoming.appointmentId,
        isRead: Boolean(incoming.isRead),
        read: Boolean(incoming.isRead),
        createdAt: incoming.createdAt || new Date().toISOString(),
        timestamp: incoming.createdAt || new Date().toISOString(),
      };

      // 1. Update notifications list functionally based on latest prev state
      setNotifications((prev) => {
        if (prev.some((n) => n.id === normalized.id)) {
          return prev;
        }
        const next = [normalized, ...prev];
        const newUnreadCount = Math.max(0, next.filter((n) => !n.isRead && !n.read).length);
        setUnreadCount(newUnreadCount);
        return next;
      });

      // 2. Show in-app Toast alert
      let toastType = "info";
      const titleLower = normalized.title.toLowerCase();
      if (titleLower.includes("confirmed") || titleLower.includes("booked") || titleLower.includes("completed")) {
        toastType = "success";
      } else if (titleLower.includes("cancelled") || titleLower.includes("error")) {
        toastType = "error";
      } else if (titleLower.includes("reminder") || titleLower.includes("warning")) {
        toastType = "warning";
      }

      showToast({
        title: normalized.title,
        message: normalized.message,
        type: toastType,
        duration: 5000,
      });

      // 3. Dispatch event so open notification pages immediately refresh
      window.dispatchEvent(new Event("medibook_notifications_updated"));
    });

    return () => {
      unsubscribe();
    };
  }, [showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        showToast,
      }}
    >
      {children}

      {/* Global In-App Real-Time Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container" style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999 }}>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
