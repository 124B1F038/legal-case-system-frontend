import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Home";
import UnifiedLogin from "./pages/UnifiedLogin";
import UserSystem from "./pages/UserSystem";

import Dashboard from "./pages/Dashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import Clients from "./pages/Clients";
import Lawyers from "./pages/Lawyers";
import Judges from "./pages/Judges";
import Cases from "./pages/Cases";
import Documents from "./pages/Documents";
import Hearings from "./pages/Hearings";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";

import ClientDashboard from "./components/ClientDashboard";
import ClientSignup from "./pages/ClientSignup";

function App() {
  return (
    <Router>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Login Pages */}
        <Route path="/login" element={<UnifiedLogin />} />

        {/* User System */}
        <Route path="/user-system" element={<UserSystem />} />

        {/* Admin / Main Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/lawyers" element={<Lawyers />} />
        <Route path="/judges" element={<Judges />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/hearings" element={<Hearings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Client Dashboard */}
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client-signup" element={<ClientSignup />} />

        {/* Lawyer & Judge Dashboards */}
        <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
        <Route path="/judge-dashboard" element={<JudgeDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;