// src/routes/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
// import ChickenPage from "../pages/ChickenPage";
// import SalaryPage from "../pages/SalaryPage";
// import CalendarPage from "../pages/CalendarPage";
import LoginPage from "../pages/LoginPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* <Route path="/chicken" element={<ChickenPage />} />
      <Route path="/salary" element={<SalaryPage />} />
      <Route path="/calendar" element={<CalendarPage />} /> */}
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
