import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./theme/theme.css";
import "./index.css";
import App from "./App.jsx";
import { initializeDemoData, migrateData } from "./utils/storage";

initializeDemoData();
migrateData();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);