import { useParams } from "react-router-dom";
import appointments from "../data/appointments";
import Card from "../components/Card";

function AppointmentDetails() {
    const { id } = useParams();

    const appointment = appointments.find(
        (item) => item.id === id
    );

    if (!appointment) {
        return <h2>Appointment not found</h2>;
    }

    return (
        <div>
            <h1>Appointment Details</h1>

            <Card>
                <h2>{appointment.doctorName}</h2>

                <p>
                    <strong>Specialty:</strong>{" "}
                    {appointment.specialty}
                </p>

                <p>
                    <strong>Date:</strong>{" "}
                    {appointment.date}
                </p>

                <p>
                    <strong>Time:</strong>{" "}
                    {appointment.time}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {appointment.status}
                </p>

                <button>
                    <button
                        onClick={() => {
                            alert("Reschedule feature coming soon");
                        }}
                    >
                        Reschedule Appointment
                    </button>
                </button>

                <button>
                    <button
                        onClick={() => {
                            const confirmCancel = window.confirm(
                                "Are you sure you want to cancel this appointment?"
                            );

                            if (confirmCancel) {
                                alert("Appointment cancelled successfully");
                            }
                        }}
                    >
                        Cancel Appointment
                    </button>
                </button>
            </Card>
        </div>
    );
}

export default AppointmentDetails;