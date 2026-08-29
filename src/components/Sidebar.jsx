import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearCurrentUser } from "../utils/storage";

import {
    Menu,
    LayoutDashboard,
    Users,
    CalendarDays,
    CalendarClock,
    Bell,
    Settings,
    User,
    LogOut,
} from "lucide-react";

function Sidebar() {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

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

            <nav className="sidebar-nav">
                <NavLink to="/doctor/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard className="sidebar-icon" />
                    <span className="sidebar-label">Dashboard</span>
                </NavLink>

                <NavLink to="/doctor/appointments" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <CalendarDays className="sidebar-icon" />
                    <span className="sidebar-label">My Appointments</span>
                </NavLink>

                <NavLink to="/doctor/patients" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Users className="sidebar-icon" />
                    <span className="sidebar-label">Patients</span>
                </NavLink>
                
                <NavLink to="/doctor/schedule" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <CalendarClock className="sidebar-icon" />
                    <span className="sidebar-label">Schedule</span>
                </NavLink>

                <NavLink to="/doctor/notifications" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Bell className="sidebar-icon" />
                    <span className="sidebar-label">Notifications</span>
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <NavLink to="/doctor/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <User className="sidebar-icon" />
                    <span className="sidebar-label">Profile</span>
                </NavLink>
                
                <NavLink to="/doctor/settings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Settings className="sidebar-icon" />
                    <span className="sidebar-label">Settings</span>
                </NavLink>

                <button className="sidebar-item logout" onClick={handleLogout}>
                    <LogOut className="sidebar-icon" />
                    <span className="sidebar-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;