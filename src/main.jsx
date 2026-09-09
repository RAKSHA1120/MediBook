import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./theme/theme.css";
import "./index.css";
import App from "./App.jsx";


import { getCurrentPatient, getCurrentDoctor, getCurrentUser } from "./utils/auth.js";
import doctors from "./data/doctors.js";
import { getPatientNotifications, addNotification } from "./data/notifications.js";

window.getHospitals = () => [];
window.getCurrentPatient = getCurrentPatient;
window.getCurrentDoctor = getCurrentDoctor;
window.getCurrentUser = getCurrentUser;
window.getDoctors = () => doctors;
window.getPatientNotifications = getPatientNotifications;
window.storageAddNotif = addNotification;
window.getPatientAppointments = () => [];
window.getCurrentPatient = getCurrentPatient;
window.getCurrentDoctor = getCurrentDoctor;
window.getCurrentUser = getCurrentUser;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
