export const adminStats = {
  totalDoctors: 45,
  totalPatients: 1250,
  totalAppointments: 320,
  todayAppointments: 42,
  completedAppointments: 215,
  cancelledAppointments: 12
};

export const adminRecentAppointments = [
  { id: "APT-001", patientName: "Rahul Sharma", doctorName: "Dr. Sarah Smith", date: "2026-08-28", time: "10:00 AM", type: "Consultation", status: "Upcoming" },
  { id: "APT-002", patientName: "Priya Patel", doctorName: "Dr. James Wilson", date: "2026-08-28", time: "11:30 AM", type: "Follow-up", status: "Completed" },
  { id: "APT-003", patientName: "Amit Kumar", doctorName: "Dr. Emily Chen", date: "2026-08-28", time: "02:00 PM", type: "Checkup", status: "Pending" },
  { id: "APT-004", patientName: "Neha Singh", doctorName: "Dr. Michael Brown", date: "2026-08-28", time: "04:15 PM", type: "Consultation", status: "Upcoming" }
];

export const adminRecentDoctors = [
  { id: "DOC-101", name: "Dr. Aisha Khan", specialization: "Neurology", hospital: "City Hospital", date: "2026-08-25", status: "Active" },
  { id: "DOC-102", name: "Dr. Rohan Gupta", specialization: "Orthopedics", hospital: "General Hospital", date: "2026-08-26", status: "Pending" },
  { id: "DOC-103", name: "Dr. Sneha Reddy", specialization: "Dermatology", hospital: "Skin Care Clinic", date: "2026-08-27", status: "Active" }
];

// Seed data for ID generation and list viewing
export const initialDoctorsData = [
  { id: "D1", name: "Sarah Smith", specialization: "Cardiology", qualification: "MD, DM", hospital: "City Heart Center", experience: "12 years", fee: 1000, contact: "sarah.smith@example.com", status: "Active", loginId: "sarah1980" },
  { id: "D2", name: "James Wilson", specialization: "Pediatrics", qualification: "MD", hospital: "Children's Care", experience: "8 years", fee: 800, contact: "james.w@example.com", status: "Active", loginId: "james1985" },
  { id: "D3", name: "Arun", specialization: "Neurology", qualification: "MD", hospital: "Neuro Care", experience: "5 years", fee: 1200, contact: "arun@example.com", status: "Active", loginId: "arun2005" }
];

export const initialPatientsData = [
  { id: "P1", name: "Rahul Sharma", age: 34, gender: "Male", contact: "9876543210", date: "2026-01-15", appointments: 5, status: "Active" },
  { id: "P2", name: "Priya Patel", age: 28, gender: "Female", contact: "9876543211", date: "2026-02-20", appointments: 2, status: "Active" },
  { id: "P3", name: "Amit Kumar", age: 45, gender: "Male", contact: "9876543212", date: "2026-03-10", appointments: 1, status: "Inactive" }
];

export const adminNotifications = [
  { id: 1, title: "New Doctor Registration", message: "Dr. Rohan Gupta has registered and is pending approval.", time: "10 mins ago", read: false, type: "registration" },
  { id: 2, title: "Appointment Cancelled", message: "Rahul Sharma cancelled their appointment with Dr. Sarah Smith.", time: "1 hour ago", read: false, type: "cancellation" },
  { id: 3, title: "System Update", message: "MediBook system will undergo maintenance at 2 AM tonight.", time: "3 hours ago", read: true, type: "system" }
];
