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
                    <Users className="sidebar-icon" />
                    <span className="sidebar-label">Patients</span>
                </button>

                <button className="sidebar-item">
                    <CalendarDays className="sidebar-icon" />
                    <span className="sidebar-label">Appointments</span>
                </button>

                <button className="sidebar-item">
                    <Stethoscope className="sidebar-icon" />
                    <span className="sidebar-label">Doctors</span>
                </button>

                <button className="sidebar-item">
                    <FlaskConical className="sidebar-icon" />
                    <span className="sidebar-label">Laboratory</span>
                </button>

                <button className="sidebar-item">
                    <Pill className="sidebar-icon" />
                    <span className="sidebar-label">Pharmacy</span>
                </button>

                <button className="sidebar-item">
                    <CreditCard className="sidebar-icon" />
                    <span className="sidebar-label">Billing</span>
                </button>

                <button className="sidebar-item">
                    <BarChart3 className="sidebar-icon" />
                    <span className="sidebar-label">Reports</span>
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