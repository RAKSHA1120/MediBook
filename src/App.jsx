import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { AppointmentProvider } from "./context/AppointmentContext";

function App() {
  return (
    <AppointmentProvider>
      <AppRoutes />
    </AppointmentProvider>
  );
}

export default App;