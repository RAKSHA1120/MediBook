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

    const handleReschedule = () => {
        alert("Reschedule feature coming soon");
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (confirmCancel) {
            alert("Appointment cancelled successfully");
        }
    };

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

                <div>
                    <button onClick={handleReschedule}>
                        Reschedule Appointment
                    </button>

                    <button onClick={handleCancel}>
                        Cancel Appointment
                    </button>
                </div>
            </Card>
        </div>
    );
}

export default AppointmentDetails;