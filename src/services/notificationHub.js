import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";

import { BASE_URL } from "../utils/api";

const getHubUrl = () => {
  const baseUrl = BASE_URL.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  return `${baseUrl}/notificationHub`;
};

class NotificationHubService {
  constructor() {
    this.connection = null;
    this.currentUserId = null;
    this.isConnecting = false;
    this.listeners = new Set();
  }

  async startConnection(userId) {
    if (!userId) return null;

    // If already connected with the same user, return existing connection
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected &&
      this.currentUserId === userId
    ) {
      return this.connection;
    }

    // If user changed, stop previous connection first
    if (this.connection && this.currentUserId !== userId) {
      await this.stopConnection();
    }

    if (this.isConnecting) return null;
    this.isConnecting = true;
    this.currentUserId = userId;

    const hubUrl = getHubUrl();

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    // Attach reconnected handler to re-join user group
    this.connection.onreconnected(async () => {
      if (this.currentUserId) {
        try {
          await this.connection.invoke("JoinUserGroup", Number(this.currentUserId));
        } catch (err) {
          console.warn("[SignalR] Failed to rejoin group after reconnect:", err);
        }
      }
    });

    // Listen for real-time notifications
    this.connection.on("ReceiveNotification", (notification) => {
      this.listeners.forEach((listener) => {
        try {
          listener(notification);
        } catch (e) {
          console.error("[SignalR] Listener error:", e);
        }
      });
    });

    try {
      await this.connection.start();
      await this.connection.invoke("JoinUserGroup", Number(userId));
      return this.connection;
    } catch (error) {
      console.warn("[SignalR] Connection start failed:", error);
      return null;
    } finally {
      this.isConnecting = false;
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        if (this.currentUserId && this.connection.state === HubConnectionState.Connected) {
          await this.connection.invoke("LeaveUserGroup", Number(this.currentUserId));
        }
        await this.connection.stop();
      } catch (err) {
        console.warn("[SignalR] Stop error:", err);
      } finally {
        this.connection = null;
        this.currentUserId = null;
      }
    }
  }

  onNotificationReceived(callback) {
    if (typeof callback === "function") {
      this.listeners.add(callback);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  getConnectionState() {
    return this.connection ? this.connection.state : HubConnectionState.Disconnected;
  }
}

export const notificationHub = new NotificationHubService();
