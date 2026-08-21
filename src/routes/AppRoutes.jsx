import { Routes, Route, Navigate } from "react-router-dom";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";
import PatientDashboard from "../pages/PatientDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route
        path="/design-system"
        element={<DesignSystem />}
      />
    </Routes>
  );
}

export default AppRoutes;