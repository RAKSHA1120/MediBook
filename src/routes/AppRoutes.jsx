import { Routes, Route, Navigate } from "react-router-dom";
import DesignSystem from "../pages/DesignSystem";
import Login from "../pages/Login";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/design-system"
        element={<DesignSystem />}
      />
    </Routes>
  );
}

export default AppRoutes;