import { Routes, Route } from "react-router-dom";
import DesignSystem from "../pages/DesignSystem";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>MediBook Home</h1>} />
      <Route
        path="/design-system"
        element={<DesignSystem />}
      />
    </Routes>
  );
}

export default AppRoutes;