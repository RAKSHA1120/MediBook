import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getCurrentUser, getCurrentDoctor } from "../utils/auth";
import "../pages/PatientDashboard.css"; // Use shared layout system instead of App.css

function DashboardLayout({ children }) {
    const navigate = useNavigate();
    
    // Sidebar state management mirroring AdminLayout
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem("medibook_doctor_sidebar_collapsed") === "true";
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("medibook_doctor_sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    const user = getCurrentUser();
    const doc = getCurrentDoctor();

    const doctorName = doc?.name || user?.name || "Doctor";
    const displayName = doctorName.toLowerCase().startsWith("dr.")
        ? doctorName
        : `Dr. ${doctorName}`;

    return (
        <div className="patient-dashboard-layout">
            <Sidebar 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <div className="patient-dashboard-main">
                <Navbar
                    userName={displayName}
                    userRole="Doctor"
                    avatarLetter={(doctorName[0] || "D").toUpperCase()}
                    hideTabs={true}
                    onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
                    onNotificationClick={() => navigate("/doctor/notifications")}
                    onProfileClick={() => navigate("/doctor/profile")}
                />

                <main className="patient-dashboard-content-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;