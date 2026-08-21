import { Link } from "react-router-dom";
import appointments from "../data/appointments";
import Card from "../components/Card";

function Dashboard() {
    const upcoming = appointments.find(
        (appointment) => appointment.status === "Upcoming"
    );

    const upcomingCount = appointments.filter(
        (appointment) => appointment.status === "Upcoming"
    ).length;

    const completedCount = appointments.filter(
        (appointment) => appointment.status === "Completed"
    ).length;

    const cancelledCount = appointments.filter(
        (appointment) => appointment.status === "Cancelled"
    ).length;

    return (
        <div className="page-container">

            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, Santhosh 👋</h1>
                    <p>Manage your healthcare appointments easily.</p>
                </div>
            </div>

            {upcoming && (
                <Card>
                    <div className="upcoming-header">
                        <div>
                            <p className="section-label">
                                Upcoming Appointment
                            </p>

                            <h2>{upcoming.doctorName}</h2>

                            <p className="specialty">
                                {upcoming.specialty}
                            </p>
                        </div>

                        <span className="status status-upcoming">
                            {upcoming.status}
                        </span>
                    </div>

                    <div className="appointment-details">
                        <span>📅 {upcoming.date}</span>
                        <span>🕐 {upcoming.time}</span>
                    </div>

                    <Link
                        to={`/appointments/${upcoming.id}`}
                        className="view-button"
                    >
                        View Appointment
                    </Link>
                </Card>
            )}

            <div className="dashboard-stats">

                <Card>
                    <div className="stat-card">
                        <span className="stat-number">
                            {appointments.length}
                        </span>
                        <span className="stat-label">
                            My Appointments
                        </span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card">
                        <span className="stat-number">
                            {upcomingCount}
                        </span>
                        <span className="stat-label">
                            Upcoming
                        </span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card">
                        <span className="stat-number">
                            {completedCount}
                        </span>
                        <span className="stat-label">
                            Completed
                        </span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card">
                        <span className="stat-number">
                            {cancelledCount}
                        </span>
                        <span className="stat-label">
                            Cancelled
                        </span>
                    </div>
                </Card>

            </div>

            <div className="dashboard-actions">

                <Link
                    to="/appointments"
                    className="dashboard-action"
                >
                    View My Appointments
                </Link>

                <Link
                    to="/profile"
                    className="dashboard-action secondary"
                >
                    View My Profile
                </Link>

            </div>

        </div>
    );
}

export default Dashboard;