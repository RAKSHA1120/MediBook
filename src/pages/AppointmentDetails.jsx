import { useParams } from "react-router-dom";
import appointments from "../data/appointments";
import Card from "../components/Card";
import Button from "../components/Button";

function AppointmentDetails() {
    const { id } = useParams();

    const appointment = appointments.find(
        (item) => item.id === id
    );

    if (!appointment) {
        return <h2>Appointment not found</h2>;
    }

    return (
        <div style={{
            padding: "var(--space-2xl)",
            maxWidth: "900px",
            margin: "0 auto",
        }}>
            <h1>Appointment Details</h1>

            <Card>
                <h2>{appointment.doctorName}</h2>

                <p>{appointment.specialty}</p>

                <p>{appointment.date}</p>

                <p>{appointment.time}</p>

                <p>{appointment.status}</p>
            </Card>
        </div>
        
    );
}

export default AppointmentDetails;