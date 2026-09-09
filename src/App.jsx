import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { AppointmentProvider } from "./context/AppointmentContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <AppointmentProvider>
        <AppRoutes />
      </AppointmentProvider>
    </NotificationProvider>
  );
}

export default App;

