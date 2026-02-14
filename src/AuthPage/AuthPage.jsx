import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MultiStepForm from "./MultiStepForm";
import { Activity } from "lucide-react"; 

function AuthPage() {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

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

  const handleLogin = () => {
    const storedUser = JSON.parse(localStorage.getItem("patientData"));

    if (
      storedUser &&
      storedUser.username === loginData.username &&
      storedUser.password === loginData.password
    ) {
      navigate("/dashboard");
    } else {
      alert("Invalid credentials or user not found.");
    }
  };

  return (
    <>
    <div className="flex justify-center items-center gap-2">
          <Activity size={40} color="#1FBCF9" />
          <h1 className="text-3xl font-semibold">Arogya</h1>
        </div>
      {isCreating ? (
        <MultiStepForm />
      ) : (
        <div className="min-h-screen bg-black flex justify-center items-center text-white">
          <div className="bg-[#111] p-8 rounded-lg w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-center">Login</h2>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={loginData.username}
              onChange={handleLoginChange}
              className="w-full p-2 rounded bg-black border border-gray-600"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full p-2 rounded bg-black border border-gray-600"
            />

            <button
              onClick={handleLogin}
              className="w-full bg-[#1FBCF9] py-2 rounded"
            >
              Login
            </button>

            <p className="text-center text-sm">
              New user?{" "}
              <span
                onClick={() => setIsCreating(true)}
                className="text-[#1FBCF9] cursor-pointer"
              >
                Create Account
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AuthPage;
