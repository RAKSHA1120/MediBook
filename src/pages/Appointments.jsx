import { Link } from "react-router-dom";
import appointments from "../data/appointments";
import Card from "../components/Card";

function Appointments() {
    return (
        <div className="page-container">
            <h1>My Appointments</h1>

            <div className="appointments-list">
                {appointments.map((appointment) => (
                    <Card key={appointment.id}>
                        <div className="appointment-card">

                            <div className="appointment-info">
                                <h2>{appointment.doctorName}</h2>

                                <p className="specialty">
                                    {appointment.specialty}
                                </p>

                                <div className="appointment-details">
                                    <span>
                                        📅 {appointment.date}
                                    </span>

                                    <span>
                                        🕐 {appointment.time}
                                    </span>
                                </div>

                                <span
                                    className={`status status-${appointment.status.toLowerCase()}`}
                                >
                                    {appointment.status}
                                </span>
                            </div>

                            <Link
                                to={`/appointments/${appointment.id}`}
                                className="view-button"
                            >
                                View Details
                            </Link>

                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default Appointments;