import { Link } from "react-router-dom";
import {
    Search,
    Bell,
    ChevronDown,
    LayoutDashboard,
    Users,
    CalendarDays,
    Stethoscope,
    Menu,
} from "lucide-react";

function Navbar({
    userName = "Raksha N",
    userRole = "Admin",
    avatarLetter = "R",
    hideTabs = false,
    hideSearch = false,
    onMenuClick,
    searchPlaceholder = "Search patients...",
}) {
    return (
        <header className="navbar">

            {/* Left - Page / Brand */}
            <div className="navbar-left">
                {onMenuClick && (
                    <button className="navbar-menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
                        <Menu size={20} />
                    </button>
                )}
                <Link to="/patient-dashboard" className="navbar-brand" style={{ textDecoration: "none" }}>
                    MediBook
                </Link>

                {!hideTabs && (
                    <nav className="navbar-tabs">
                        <button className="navbar-tab active">
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </button>

                        <button className="navbar-tab">
                            <Users size={18} />
                            <span>Patients</span>
                        </button>

                        <button className="navbar-tab">
                            <CalendarDays size={18} />
                            <span>Appointments</span>
                        </button>

                        <button className="navbar-tab">
                            <Stethoscope size={18} />
                            <span>Doctors</span>
                        </button>
                    </nav>
                )}
            </div>

            {/* Right */}
            <div className="navbar-right">

                {/* Search */}
                {!hideSearch && (
                    <div className="navbar-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                        />

                        <span className="search-shortcut">
                            Ctrl + K
                        </span>
                    </div>
                )}

                {/* Notification */}
                <button
                    className="navbar-icon-button"
                    title="Notifications"
                >
                    <Bell size={20} />

                    <span className="notification-badge">
                        3
                    </span>
                </button>

                {/* Profile */}
                <button className="navbar-profile">

                    <span className="profile-avatar">
                        {avatarLetter}
                    </span>

                    <span className="profile-info">
                        <strong>{userName}</strong>
                        <small>{userRole}</small>
                    </span>

                    <ChevronDown size={16} />

                </button>

            </div>

        </header>
    );
}

export default Navbar;