const defaultAppointments = [
    {
        id: "APT001",
        doctorName: "Dr. Priya Sharma",
        specialty: "Cardiologist",
        date: "2026-08-20",
        time: "10:00 AM",
        status: "Upcoming"
    },
    {
        id: "APT002",
        doctorName: "Dr. Arun Kumar",
        specialty: "Dermatologist",
        date: "2026-08-15",
        time: "02:30 PM",
        status: "Completed"
    },
    {
        id: "APT002",
        doctorName: "Dr. Arun Kumar",
        specialty: "Dermatologist",
        date: "2026-08-15",
        time: "02:30 PM",
        status: "Completed"
    },
    {
        id: "APT003",
        doctorName: "Dr. Meena Raj",
        specialty: "Neurologist",
        date: "2026-08-10",
        time: "11:00 AM",
        status: "Cancelled"
    }
];

const storedAppointments = localStorage.getItem("medibook_appointments");
const appointments = storedAppointments ? JSON.parse(storedAppointments) : defaultAppointments;

export default appointments;