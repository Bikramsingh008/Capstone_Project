import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Pages/LandingPage/Navbar";
import DoctorAppointments from "./DoctorAppointments";
import ChatAssistant from "./ChatAssistant";
import HealthReports from "./HealthReports";
import MedicationManager from "./MedicationManager";
import WellnessTips from "./WellnessTips";

function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setEditForm(parsed);
    } else {
      // Mock data for ease of demonstration if running directly without login
      setData({
        username: "Demo User",
        gender: "Male",
        age: 24,
        weight: 70,
        height: 175,
        bmi: 22.8,
        systolic: 120,
        diastolic: 80,
        bloodGroup: "O+",
        happinessLevel: 8,
        feeling: "Good",
        stressLevel: "Moderate",
        sleepQuality: "Fair"
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/signup");
  };

  const handleSaveProfile = async () => {
    try {
      if (data?.id) {
        const res = await axios.put(`http://localhost:3000/api/users/${data.id}`, editForm);
        setData(res.data.user);
        setEditForm(res.data.user);
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        alert("Profile Successfully Updated!");
      } else {
        setData(editForm);
      }
      setIsEditing(false);
    } catch (err) {
      alert("Error saving profile");
    }
  };

  if (!data) return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading Data...</div>;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white pt-28 px-6 pb-20">
        
        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto mb-8 bg-white/5 p-2 rounded-xl border border-white/10 flex flex-wrap gap-2 justify-center shadow-[0_0_20px_rgba(31,188,249,0.1)]">
          {[
            { id: 'profile', icon: '👤', label: 'My Profile' },
            { id: 'reports', icon: '🩺', label: 'Symptom Tracking & Reports' },
            { id: 'medications', icon: '💊', label: 'Medications' },
            { id: 'wellness', icon: '❤️', label: 'Wellness Tips' },
            { id: 'chat', icon: '✨', label: 'AI Recommendations (Chat)' },
            { id: 'doctors', icon: '👨‍⚕️', label: 'Book Doctor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#1FBCF9] text-white shadow-[0_0_15px_rgba(31,188,249,0.5)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          {/* PROFILE VIEW */}
          {activeTab === "profile" && (
            <div className="bg-gradient-to-br from-[#1FBCF9]/20 to-white/5 backdrop-blur-lg border border-[#1FBCF9]/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(31,188,249,0.25)] space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Welcome back, {data.username} 👋</h1>
                <div className="space-x-3">
                  {isEditing ? (
                    <button onClick={handleSaveProfile} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-semibold">
                      Save Profile
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-[#1FBCF9] text-white hover:bg-blue-600 rounded-lg transition font-semibold">
                      ✏️ Edit Profile
                    </button>
                  )}
                  <button onClick={handleLogout} className="px-6 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 rounded-lg transition">
                    Logout
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Stats Grid */}
                {[
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "phone" },
                  { label: "Gender", key: "gender" },
                  { label: "Age", key: "age" },
                  { label: "Weight (kg)", key: "weight" },
                  { label: "Height (cm)", key: "height" },
                  { label: "BMI", key: "bmi" },
                  { label: "Blood Group", key: "bloodGroup" },
                  { label: "Happiness Level", key: "happinessLevel" },
                  { label: "Mood", key: "feeling" },
                  { label: "Stress Level", key: "stressLevel" },
                  { label: "Sleep Quality", key: "sleepQuality" }
                ].map((stat, i) => (
                  <div key={i} className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <p className="text-[#1FBCF9] text-sm mb-1">{stat.label}</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm[stat.key] || ""} 
                        onChange={(e) => setEditForm({ ...editForm, [stat.key]: e.target.value })}
                        className="w-full bg-black/60 px-3 py-1 rounded border border-[#1FBCF9]/40 focus:outline-none focus:border-[#1FBCF9] text-white"
                      />
                    ) : (
                      <p className="text-xl font-semibold">{data[stat.key] || "N/A"}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYMPTOM TRACKING & REPORTS VIEW */}
          {activeTab === "reports" && <HealthReports data={data} />}

          {/* MEDICATIONS VIEW */}
          {activeTab === "medications" && <MedicationManager data={data} />}

          {/* WELLNESS TIPS VIEW */}
          {activeTab === "wellness" && <WellnessTips />}

          {/* AI CHAT VIEW */}
          {activeTab === "chat" && <div className="max-w-3xl mx-auto"><ChatAssistant data={data} /></div>}

          {/* DOCTORS VIEW */}
          {activeTab === "doctors" && <DoctorAppointments data={data} />}
          
        </div>
      </div>
    </>
  );
}

export default Dashboard;
