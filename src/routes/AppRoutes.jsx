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
import Appointments from "../pages/Appointments";
import AppointmentDetails from "../pages/AppointmentDetails";
import PatientProfile from "../pages/PatientProfile";
import Notifications from "../pages/Notifications";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* These pages already have their own layout (from Raksha's code) */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctor-profile" element={<DoctorProfile />} />
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/design-system" element={<DesignSystem />} />
        
        {/* These pages use the wrapper layout */}
        <Route path="/appointments" element={<PatientLayout><Appointments /></PatientLayout>} />
        <Route path="/appointments/:id" element={<PatientLayout><AppointmentDetails /></PatientLayout>} />
        <Route path="/profile" element={<PatientLayout><PatientProfile /></PatientLayout>} />
        <Route path="/notifications" element={<PatientLayout><Notifications /></PatientLayout>} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
