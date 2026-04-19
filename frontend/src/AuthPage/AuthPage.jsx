import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MultiStepForm from "./MultiStepForm";
import { Activity } from "lucide-react";
import Navbar from "../Pages/LandingPage/Navbar";

function AuthPage() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isPressed, setIsPressed] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/users/login", loginData);
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid username or password.");
    }
  };

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 20;
    const rotateY = (x - centerX) / 20;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(${isPressed ? 0.98 : 1.03})
    `;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center pt-24">

        <div className="absolute w-96 h-96 bg-[#1FBCF9] opacity-20 rounded-full blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl bottom-0 right-0"></div>

        {isCreating ? (
          <MultiStepForm />
        ) : (
          <div className="relative z-10 w-full max-w-md">

            <div className="flex justify-center items-center gap-3 mb-8">
              <div className="bg-[#1FBCF9]/20 p-3 rounded-full">
                <Activity size={32} color="#1FBCF9" />
              </div>
              <h1 className="text-3xl font-semibold tracking-wide">
                Arogya
              </h1>
            </div>

            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
              className="relative p-8 rounded-2xl space-y-6 transition-transform duration-200 shadow-[0_0_40px_rgba(31,188,249,0.25)]"
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.2s ease",
                background:
                  "linear-gradient(145deg, rgba(31,188,249,0.15), rgba(255,255,255,0.03))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(31,188,249,0.25)",
              }}
            >

              <h2 className="text-2xl font-semibold text-center">
                Welcome Back
              </h2>

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={loginData.username}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-[#1FBCF9]"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-[#1FBCF9]"
              />

              {/* ✅ FIXED BUTTON */}
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-[#1FBCF9] to-blue-500 py-3 rounded-lg font-medium hover:scale-[1.02] transition"
              >
                Login
              </button>

              <p className="text-center text-sm text-gray-400">
                New to Arogya?{" "}
                <span
                  onClick={() => setIsCreating(true)}
                  className="text-[#1FBCF9] cursor-pointer hover:underline"
                >
                  Create Account
                </span>
              </p>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AuthPage;
