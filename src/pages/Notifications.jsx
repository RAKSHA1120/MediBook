import { useState } from "react";
import Card from "../components/Card";

function Notifications() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Appointment Reminder",
            message: "Your appointment with Dr. Priya Sharma is tomorrow at 10:00 AM.",
            time: "2 hours ago",
            read: false
        },
        {
            id: 2,
            title: "Appointment Confirmed",
            message: "Your appointment has been confirmed successfully.",
            time: "Yesterday",
            read: false
        },
        {
            id: 3,
            title: "Appointment Completed",
            message: "Your appointment with Dr. Arun Kumar has been completed.",
            time: "2 days ago",
            read: true
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(
            notifications.map((notification) =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    return (
        <div>
            <h1>Notifications</h1>

            {notifications.length === 0 ? (
                <p>No notifications available.</p>
            ) : (
                notifications.map((notification) => (
                    <Card key={notification.id}>
                        <h2>{notification.title}</h2>

                        <p>{notification.message}</p>

                        <p>{notification.time}</p>

                        {!notification.read && (
                            <button
                                onClick={() =>
                                    markAsRead(notification.id)
                                }
                            >
                                Mark as Read
                            </button>
                        )}

                        {notification.read && (
                            <p>Read</p>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
}

export default Notifications;