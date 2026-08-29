import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";
import AppointmentBooking from "../pages/AppointmentBooking";
import BookingSuccess from "../pages/BookingSuccess";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import DoctorAppointments from "../pages/DoctorAppointments";
import DoctorPatients from "../pages/DoctorPatients";
import DoctorPatientDetails from "../pages/DoctorPatientDetails";
import DoctorSchedule from "../pages/DoctorSchedule";
import DoctorNotifications from "../pages/DoctorNotifications";
import DoctorSettings from "../pages/DoctorSettings";

import PatientLayout from "../layouts/PatientLayout";
import MyAppointments from "../pages/MyAppointments";
import AppointmentDetails from "../pages/AppointmentDetails";
import PatientProfile from "../pages/PatientProfile";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import HelpSupport from "../pages/HelpSupport";


function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* All Patient Pages Wrapped in PatientLayout */}
        <Route path="/patient-dashboard" element={<PatientLayout><PatientDashboard /></PatientLayout>} />
        <Route path="/book-appointment" element={<PatientLayout><AppointmentBooking /></PatientLayout>} />
        <Route path="/booking-success" element={<PatientLayout><BookingSuccess /></PatientLayout>} />

        <Route path="/my-appointments" element={<PatientLayout><MyAppointments /></PatientLayout>} />
        <Route path="/appointments" element={<PatientLayout><MyAppointments /></PatientLayout>} />
        <Route path="/appointments/:id" element={<PatientLayout><AppointmentDetails /></PatientLayout>} />
        <Route path="/appointment/:id" element={<PatientLayout><AppointmentDetails /></PatientLayout>} />
        <Route path="/profile" element={<PatientLayout><PatientProfile /></PatientLayout>} />
        <Route path="/notifications" element={<PatientLayout><Notifications /></PatientLayout>} />
        <Route path="/settings" element={<PatientLayout><Settings /></PatientLayout>} />
        <Route path="/help-support" element={<PatientLayout><HelpSupport /></PatientLayout>} />


        <Route path="/design-system" element={<DesignSystem />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<PatientLayout><Dashboard /></PatientLayout>} />
        <Route path="/doctor/appointments" element={<PatientLayout><DoctorAppointments /></PatientLayout>} />
        <Route path="/doctor/patients" element={<PatientLayout><DoctorPatients /></PatientLayout>} />
        <Route path="/doctor/patients/:id" element={<PatientLayout><DoctorPatientDetails /></PatientLayout>} />
        <Route path="/doctor/schedule" element={<PatientLayout><DoctorSchedule /></PatientLayout>} />
        <Route path="/doctor/notifications" element={<PatientLayout><DoctorNotifications /></PatientLayout>} />
        <Route path="/doctor/profile" element={<PatientLayout><DoctorProfile /></PatientLayout>} />
        <Route path="/doctor/settings" element={<PatientLayout><DoctorSettings /></PatientLayout>} />

        {/* All Admin Pages Wrapped in AdminLayout */}
        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/doctors" element={<AdminLayout><AdminDoctors /></AdminLayout>} />
        <Route path="/admin/patients" element={<AdminLayout><AdminPatients /></AdminLayout>} />
        <Route path="/admin/appointments" element={<AdminLayout><AdminAppointments /></AdminLayout>} />
        <Route path="/admin/appointments/:id" element={<AdminLayout><AdminAppointmentDetails /></AdminLayout>} />
        <Route path="/admin/notifications" element={<AdminLayout><AdminNotifications /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
        <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
        <Route path="/admin/help" element={<AdminLayout><AdminHelpSupport /></AdminLayout>} />

      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
