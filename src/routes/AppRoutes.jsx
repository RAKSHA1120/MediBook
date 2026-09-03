import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorList from "../pages/DoctorList";
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
import DoctorProfile from "../pages/DoctorProfile";

import PatientLayout from "../layouts/PatientLayout";
import MyAppointments from "../pages/MyAppointments";
import AppointmentDetails from "../pages/AppointmentDetails";
import PatientProfile from "../pages/PatientProfile";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import HelpSupport from "../pages/HelpSupport";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminHospitals from "../pages/AdminHospitals";
import AdminDoctors from "../pages/AdminDoctors";
import AdminPatients from "../pages/AdminPatients";
import AdminAppointments from "../pages/AdminAppointments";
import AdminAppointmentDetails from "../pages/AdminAppointmentDetails";
import AdminLoginManagement from "../pages/AdminLoginManagement";
import AdminNotifications from "../pages/AdminNotifications";
import AdminReports from "../pages/AdminReports";
import AdminProfile from "../pages/AdminProfile";
import AdminSettings from "../pages/AdminSettings";
import AdminHelpSupport from "../pages/AdminHelpSupport";

import HospitalLayout from "../layouts/HospitalLayout";
import HospitalDashboard from "../pages/HospitalDashboard";
import HospitalDoctors from "../pages/HospitalDoctors";
import HospitalAppointments from "../pages/HospitalAppointments";
import HospitalPatients from "../pages/HospitalPatients";
import HospitalNotifications from "../pages/HospitalNotifications";
import HospitalProfile from "../pages/HospitalProfile";
import HospitalSettings from "../pages/HospitalSettings";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login initialTab="signin" />} />
        <Route path="/signup" element={<Login initialTab="signup" />} />
        <Route path="/register" element={<Login initialTab="signup" />} />

        {/* All Patient Pages Wrapped in PatientLayout */}
        <Route path="/patient-dashboard" element={<PatientLayout><PatientDashboard /></PatientLayout>} />
        <Route path="/find-doctor" element={<PatientLayout><DoctorList /></PatientLayout>} />
        <Route path="/doctors" element={<PatientLayout><DoctorList /></PatientLayout>} />
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

        {/* Hospital Routes */}
        <Route path="/hospital-dashboard" element={<HospitalLayout><HospitalDashboard /></HospitalLayout>} />
        <Route path="/hospital/dashboard" element={<HospitalLayout><HospitalDashboard /></HospitalLayout>} />
        <Route path="/hospital/doctors" element={<HospitalLayout><HospitalDoctors /></HospitalLayout>} />
        <Route path="/hospital/appointments" element={<HospitalLayout><HospitalAppointments /></HospitalLayout>} />
        <Route path="/hospital/patients" element={<HospitalLayout><HospitalPatients /></HospitalLayout>} />
        <Route path="/hospital/notifications" element={<HospitalLayout><HospitalNotifications /></HospitalLayout>} />
        <Route path="/hospital/profile" element={<HospitalLayout><HospitalProfile /></HospitalLayout>} />
        <Route path="/hospital/settings" element={<HospitalLayout><HospitalSettings /></HospitalLayout>} />

        {/* All Admin Pages Wrapped in AdminLayout */}
        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/hospitals" element={<AdminLayout><AdminHospitals /></AdminLayout>} />
        <Route path="/admin/doctors" element={<AdminLayout><AdminDoctors /></AdminLayout>} />
        <Route path="/admin/patients" element={<AdminLayout><AdminPatients /></AdminLayout>} />
        <Route path="/admin/appointments" element={<AdminLayout><AdminAppointments /></AdminLayout>} />
        <Route path="/admin/login-management" element={<AdminLayout><AdminLoginManagement /></AdminLayout>} />
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
