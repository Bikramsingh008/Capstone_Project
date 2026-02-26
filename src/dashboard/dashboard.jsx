import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Pages/LandingPage/Navbar";

function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/signup");
  };

  if (!data)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        No Data Found
      </div>
    );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white pt-28 px-6">
        <h1 className="text-4xl font-bold text-center mb-10">
          Welcome, {data.username} 👋
        </h1>

        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#1FBCF9]/20 to-white/5 backdrop-blur-lg border border-[#1FBCF9]/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(31,188,249,0.25)] space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Gender</p>
              <p className="text-lg font-semibold">{data.gender}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Age</p>
              <p className="text-lg font-semibold">{data.age}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Weight</p>
              <p className="text-lg font-semibold">{data.weight} kg</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Height</p>
              <p className="text-lg font-semibold">{data.height} cm</p>
            </div>

            <div>
  <p className="text-gray-400 text-sm">BMI</p>
  <p className="text-lg font-semibold">{data.bmi}</p>
</div>

<div>
  <p className="text-gray-400 text-sm">Blood Pressure</p>
  <p className="text-lg font-semibold">
    {data.systolic}/{data.diastolic} mmHg
  </p>
</div>

            <div>
              <p className="text-gray-400 text-sm">Blood Group</p>
              <p className="text-lg font-semibold">{data.bloodGroup}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Happiness Level</p>
              <p className="text-lg font-semibold">{data.happinessLevel}/10</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Mood</p>
              <p className="text-lg font-semibold">{data.feeling}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Stress Level</p>
              <p className="text-lg font-semibold">{data.stressLevel}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Sleep Quality</p>
              <p className="text-lg font-semibold">{data.sleepQuality}</p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
