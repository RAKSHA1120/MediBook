import { useState } from "react";

import {
    Menu,
    LayoutDashboard,
    Users,
    CalendarDays,
    Stethoscope,
    FlaskConical,
    Pill,
    CreditCard,
    BarChart3,
    Settings,
    User,
    LogOut,
} from "lucide-react";

function Sidebar() {
    const [expanded, setExpanded] = useState(false);

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

                <button className="sidebar-item active">
                    <LayoutDashboard className="sidebar-icon" />
                    <span className="sidebar-label">Dashboard</span>
                </button>

                <button className="sidebar-item">
                    <CalendarDays className="sidebar-icon" />
                    <span className="sidebar-label">Appointments</span>
                </button>

            </nav>

            {/* Bottom */}
            <div className="sidebar-bottom">

                <button className="sidebar-item">
                    <Settings className="sidebar-icon" />
                    <span className="sidebar-label">Settings</span>
                </button>

                <button className="sidebar-item">
                    <User className="sidebar-icon" />
                    <span className="sidebar-label">Profile</span>
                </button>

                <button className="sidebar-item logout">
                    <LogOut className="sidebar-icon" />
                    <span className="sidebar-label">Logout</span>
                </button>

            </div>
        </aside>
    );
}

export default Sidebar;