import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Appointments from "../pages/Appointments";
import AppointmentDetails from "../pages/AppointmentDetails";
import PatientProfile from "../pages/PatientProfile";
import BookAppointment from "../pages/BookAppointment";

function AppRoutes() {
  return (
    <Routes>

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/book-appointment"
        element={<BookAppointment />}
      />

      <Route
        path="/appointments"
        element={<Appointments />}
      />

      <Route
        path="/appointments/:id"
        element={<AppointmentDetails />}
      />

      <Route
        path="/profile"
        element={<PatientProfile />}
      />

    </Routes>
  );
}

export default AppRoutes;