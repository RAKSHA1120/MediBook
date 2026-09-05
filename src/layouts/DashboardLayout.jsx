import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";
import "../App.css";

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const doc = getCurrentDoctor();

    const doctorName = doc?.name || user?.name || "Doctor";
    const displayName = doctorName.toLowerCase().startsWith("dr.")
        ? doctorName
        : `Dr. ${doctorName}`;

    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-content">
                <Navbar
                    userName={displayName}
                    userRole="Doctor"
                    avatarLetter={(doctorName[0] || "D").toUpperCase()}
                    hideTabs={true}
                    onNotificationClick={() => navigate("/doctor/notifications")}
                    onProfileClick={() => navigate("/doctor/profile")}
                />

                <main className="dashboard-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;