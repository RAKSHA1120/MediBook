import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { AppointmentProvider } from "./context/AppointmentContext";

import { useEffect } from "react";


function App() {
  useEffect(() => {
    
  }, []);

  return (
    <AppointmentProvider>
      <AppRoutes />
    </AppointmentProvider>
  );
}

export default App;
