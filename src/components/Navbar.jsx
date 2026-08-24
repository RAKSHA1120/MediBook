import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { getUnreadCount } from "../data/notifications";

function Navbar({
    userName = "Raksha N",
    userRole = "Admin",
    avatarLetter = "R",
    hideTabs = false,
    hideSearch = false,
    onMenuClick,
    onNotificationClick,
    searchPlaceholder = "Search patients...",
}) {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(() => getUnreadCount());

    useEffect(() => {
        const handleNotifUpdate = () => {
            setUnreadCount(getUnreadCount());
        };
        window.addEventListener("medibook_notifications_updated", handleNotifUpdate);
        return () => {
            window.removeEventListener("medibook_notifications_updated", handleNotifUpdate);
        };
    }, []);
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
                    onClick={() => {
                        if (onNotificationClick) {
                            onNotificationClick();
                        } else {
                            navigate("/notifications");
                        }
                    }}
                >
                    <Bell size={20} />

                    {unreadCount > 0 && (
                        <span className="notification-badge">
                            {unreadCount}
                        </span>
                    )}
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