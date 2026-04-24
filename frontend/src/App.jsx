import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingLayout from "./Pages/LandingPage/LandingLayout";
import AuthPage from "./AuthPage/AuthPage";
import Dashboard from "./dashboard/dashboard";

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
      </Routes>
    </>
  );
};

export default App;
