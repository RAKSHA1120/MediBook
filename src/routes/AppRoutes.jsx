import { Routes, Route } from "react-router-dom";
import MyAppointments from "../pages/MyAppointments";
import AppointmentDetails from "../pages/AppointmentDetails";
import PatientProfile from "../pages/PatientProfile";
import Notifications from "../pages/Notifications";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>MediBook Home</h1>} />
      <Route path="/appointments" element={<MyAppointments />} />
      <Route
        path="/appointments/:id"
        element={<AppointmentDetails />}
      />
      <Route
        path="/profile"
        element={<PatientProfile />}
      />
      <Route
        path="/notifications"
        element={<Notifications />}
      />
    </Routes>
  );
}


export default AppRoutes;