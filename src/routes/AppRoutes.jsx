import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorList from "../pages/DoctorList";
import DoctorProfile from "../pages/DoctorProfile";
import AppointmentBooking from "../pages/AppointmentBooking";
import BookingSuccess from "../pages/BookingSuccess";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctor-profile" element={<DoctorProfile />} />
        <Route path="/book-appointment" element={<AppointmentBooking />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/design-system" element={<DesignSystem />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;