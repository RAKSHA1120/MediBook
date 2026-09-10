import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { notificationHub } from "../services/notificationHub";
import { getCurrentUser } from "../utils/auth";
import { api } from "../utils/api";
import Toast from "../components/Toast";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => { },
  markAsRead: async () => { },
  markAllAsRead: async () => { },
  clearAll: async () => { },
  showToast: () => { },
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const activeUserRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = "info", duration = 5000 }) => {
      const id = Date.now() + Math.random();
      const newToast = {
        id,
        title,
        message,
        type,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const fetchNotifications = useCallback(async () => {
    const user = getCurrentUser();

    if (!user || !user.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const endpoint =
        user.role?.toLowerCase() === "admin"
          ? "/Notifications"
          : `/Notifications/user/${user.id}`;

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

        const unread = mapped.filter(
          (n) => !n.isRead && !n.read
        ).length;

        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn(
        "[NotificationContext] Failed to fetch notifications:",
        err
      );
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/Notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
              ...n,
              isRead: true,
              read: true,
            }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      window.dispatchEvent(
        new Event("medibook_notifications_updated")
      );
    } catch (err) {
      console.warn(
        "[NotificationContext] Failed to mark notification as read:",
        err
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadItems = notifications.filter(
      (n) => !n.isRead && !n.read
    );

    for (const item of unreadItems) {
      try {
        await api.put(`/Notifications/${item.id}/read`);
      } catch (e) {
        // Ignore individual failures
      }
    }

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
        read: true,
      }))
    );

    setUnreadCount(0);

    window.dispatchEvent(
      new Event("medibook_notifications_updated")
    );
  }, [notifications]);

  const clearAll = useCallback(async () => {
    const toDelete = [...notifications];

    setNotifications([]);
    setUnreadCount(0);

    for (const item of toDelete) {
      try {
        await api.delete(`/Notifications/${item.id}`);
      } catch (e) {
        // Ignore individual failures
      }
    }

    window.dispatchEvent(
      new Event("medibook_notifications_updated")
    );
  }, [notifications]);

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

    window.addEventListener(
      "medibook_current_user_updated",
      handleAuthChange
    );

    // Re-sync on global notification updates
    const handleNotifsUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener(
      "medibook_notifications_updated",
      handleNotifsUpdated
    );

    return () => {
      window.removeEventListener(
        "medibook_current_user_updated",
        handleAuthChange
      );

      window.removeEventListener(
        "medibook_notifications_updated",
        handleNotifsUpdated
      );

      notificationHub.stopConnection();
    };
  }, [fetchNotifications]);

  // Handle incoming real-time notifications via SignalR
  useEffect(() => {
    const unsubscribe = notificationHub.onNotificationReceived(
      (incoming) => {
        if (!incoming) return;

        const normalized = {
          id: incoming.id || Date.now(),
          userId: incoming.userId,
          title: incoming.title || "New Notification",
          message: incoming.message || "",
          type: incoming.type || "appointment",
          subType: incoming.subType,
          appointmentId: incoming.appointmentId,
          isRead: incoming.isRead || false,
          read: incoming.isRead || false,
          createdAt:
            incoming.createdAt || new Date().toISOString(),
          timestamp:
            incoming.createdAt || new Date().toISOString(),
        };

        // 1. Update notifications list
        setNotifications((prev) => {
          if (
            prev.some(
              (n) => n.id === normalized.id
            )
          ) {
            return prev;
          }

          return [normalized, ...prev];
        });

        // 2. Increment unread count
        setUnreadCount((prev) => prev + 1);

        // 3. Show in-app Toast notification
        let toastType = "info";

        const titleLower =
          normalized.title.toLowerCase();

        if (
          titleLower.includes("confirmed") ||
          titleLower.includes("booked") ||
          titleLower.includes("completed")
        ) {
          toastType = "success";
        } else if (
          titleLower.includes("cancelled") ||
          titleLower.includes("error")
        ) {
          toastType = "error";
        } else if (
          titleLower.includes("reminder") ||
          titleLower.includes("warning")
        ) {
          toastType = "warning";
        }

        showToast({
          title: normalized.title,
          message: normalized.message,
          type: toastType,
          duration: 5000,
        });

        // 4. Refresh notification pages
        window.dispatchEvent(
          new Event("medibook_notifications_updated")
        );
      }
    );

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
        <div
          className="toast-container"
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
          }}
        >
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() =>
                removeToast(toast.id)
              }
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