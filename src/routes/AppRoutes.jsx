import { Routes, Route, Navigate } from "react-router-dom";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";
import DoctorList from "../pages/DoctorList";
import DoctorProfile from "../pages/DoctorProfile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/doctors" element={<DoctorList />} />
      <Route path="/doctors/:doctorId" element={<DoctorProfile />} />
      <Route
        path="/design-system"
        element={<DesignSystem />}
      />
    </Routes>
  );
}

export default AppRoutes;