
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
        id: "APT003",
        doctorName: "Dr. Meena Raj",
        specialty: "Neurologist",
        date: "2026-08-10",
        time: "11:00 AM",
        status: "Cancelled"
    }
];

const storedAppointments = localStorage.getItem("medibook_appointments");
let rawAppointments = defaultAppointments;

if (storedAppointments) {
    try {
        const parsed = JSON.parse(storedAppointments);
        // If they already have some from localStorage, we should ensure the defaults are still there
        // but only if they don't already exist. A simple merge:
        const combined = [...defaultAppointments, ...parsed];
        rawAppointments = combined;
    } catch(e) {}
}

// Deduplicate by ID
const uniqueAppts = [];
const seenIds = new Set();
for (let i = rawAppointments.length - 1; i >= 0; i--) {
    const appt = rawAppointments[i];
    if (!seenIds.has(appt.id)) {
        uniqueAppts.unshift(appt);
        seenIds.add(appt.id);
    }
}

export default uniqueAppts;
