import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorList from "../pages/DoctorList";
import DoctorProfile from "../pages/DoctorProfile";
import AppointmentBooking from "../pages/AppointmentBooking";
import BookingSuccess from "../pages/BookingSuccess";

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
        <Route path="/doctors" element={<PatientLayout><DoctorList /></PatientLayout>} />
        <Route path="/doctor-profile" element={<PatientLayout><DoctorProfile /></PatientLayout>} />
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
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
