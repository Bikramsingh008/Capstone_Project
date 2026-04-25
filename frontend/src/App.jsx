import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingLayout from "./Pages/LandingPage/LandingLayout";
import AuthPage from "./AuthPage/AuthPage";
import Dashboard from "./dashboard/dashboard";
import AdminLogin from "./Pages/AdminPanel/AdminLogin";
import AdminDashboard from "./Pages/AdminPanel/AdminDashboard";

const App = () => {
  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingLayout />} />

        {/* Signup Page */}
        <Route path="/signup" element={<AuthPage />} />

        {/* Dashboard Page */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Panel */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
};

export default App;
