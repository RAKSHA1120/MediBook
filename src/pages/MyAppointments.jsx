import { useState } from "react";
import appointments from "../data/appointments";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

function MyAppointments() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("Upcoming");

    const filteredAppointments = appointments.filter(
        (appointment) => appointment.status === activeTab
    );

    return (
        <div>
            <h1>My Appointments</h1>

            <div>
                <button onClick={() => setActiveTab("Upcoming")}>
                    Upcoming
                </button>

                <button onClick={() => setActiveTab("Completed")}>
                    Completed
                </button>

                <button onClick={() => setActiveTab("Cancelled")}>
                    Cancelled
                </button>
            </div>

            <div>
                {filteredAppointments.length === 0 ? (
                    <p>No appointments found.</p>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <Card key={appointment.id}>
                            <h2>{appointment.doctorName}</h2>

                            <p>{appointment.specialty}</p>

                            <p>Date: {appointment.date}</p>

                            <p>Time: {appointment.time}</p>

                            <p>Status: {appointment.status}</p>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/appointments/${appointment.id}`
                                    )
                                }
                            >
                                View
                            </button>

                            {appointment.status === "Upcoming" && (
                                <button>
                                    Cancel
                                </button>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

export default MyAppointments;