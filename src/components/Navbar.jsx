import {
    Search,
    Bell,
    ChevronDown,
    LayoutDashboard,
    Users,
    CalendarDays,
    Stethoscope,
} from "lucide-react";

function Navbar() {
    return (
        <header className="navbar">

            {/* Left - Page / Brand */}
            <div className="navbar-left">
                <h1 className="navbar-brand">MediBook</h1>

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
            </div>

            {/* Right */}
            <div className="navbar-right">

                {/* Search */}
                <div className="navbar-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search patients..."
                    />

                    <span className="search-shortcut">
                        Ctrl + K
                    </span>
                </div>

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
                        R
                    </span>

                    <span className="profile-info">
                        <strong>Raksha N</strong>
                        <small>Admin</small>
                    </span>

                    <ChevronDown size={16} />

                </button>

            </div>

        </header>
    );
}

export default Navbar;