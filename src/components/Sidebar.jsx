import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    LayoutDashboard,
    CalendarDays,
    Users,
    CalendarClock,
    Settings,
    User,
    LogOut,
} from "lucide-react";
import { clearCurrentUser } from "../utils/auth";

function Sidebar() {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        clearCurrentUser();
        navigate("/login");
    };

    return (
        <aside
            className={`sidebar ${expanded ? "sidebar-expanded" : ""}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            {/* Brand / Menu */}
            <div className="sidebar-brand">
                <button
                    className="sidebar-menu-button"
                    onClick={() => setExpanded(!expanded)}
                    title="Menu"
                >
                    {expanded ? <Menu /> : <span className="brand-mark">M</span>}
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">

                <button
                    className={`sidebar-item ${isActive("/doctor/dashboard") ? "active" : ""}`}
                    onClick={() => navigate("/doctor/dashboard")}
                >
                    <LayoutDashboard className="sidebar-icon" />
                    <span className="sidebar-label">Dashboard</span>
                </button>

                <button
                    className={`sidebar-item ${isActive("/doctor/appointments") ? "active" : ""}`}
                    onClick={() => navigate("/doctor/appointments")}
                >
                    <CalendarDays className="sidebar-icon" />
                    <span className="sidebar-label">Appointments</span>
                </button>

                <button
                    className={`sidebar-item ${isActive("/doctor/patients") ? "active" : ""}`}
                    onClick={() => navigate("/doctor/patients")}
                >
                    <Users className="sidebar-icon" />
                    <span className="sidebar-label">Patients</span>
                </button>

                <button
                    className={`sidebar-item ${isActive("/doctor/schedule") ? "active" : ""}`}
                    onClick={() => navigate("/doctor/schedule")}
                >
                    <CalendarClock className="sidebar-icon" />
                    <span className="sidebar-label">Schedule</span>
                </button>

            </nav>

            {/* Bottom */}
            <div className="sidebar-bottom">

                <button
                    className={`sidebar-item ${isActive("/doctor/settings") ? "active" : ""}`}
                    onClick={() => navigate("/doctor/settings")}
                >
                    <Settings className="sidebar-icon" />
                    <span className="sidebar-label">Settings</span>
                </button>

                <button
                    className={`sidebar-item ${isActive("/doctor/profile") ? "active" : ""}`}
                    onClick={() => navigate("/doctor/profile")}
                >
                    <User className="sidebar-icon" />
                    <span className="sidebar-label">Profile</span>
                </button>

                <button className="sidebar-item logout" onClick={handleLogout}>
                    <LogOut className="sidebar-icon" />
                    <span className="sidebar-label">Logout</span>
                </button>

            </div>
        </aside>
    );
}

export default Sidebar;