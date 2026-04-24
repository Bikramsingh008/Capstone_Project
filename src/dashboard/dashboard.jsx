import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BarChart2,
  Calendar,
  MessageSquare,
  FileText,
  User,
  Send
} from "lucide-react";
import axios from "axios";

import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, BarChart, Bar
} from "recharts";

const COLORS = ["#1FBCF9", "#00C49F", "#FFBB28", "#F97316"];

function Dashboard() {

  const [data, setData] = useState(null);
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState([]);
  const [newSymptom, setNewSymptom] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setData(JSON.parse(stored));

    const storedSymptoms = localStorage.getItem("symptoms");
    if (storedSymptoms) setSymptoms(JSON.parse(storedSymptoms));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/signup");
  };

  const addSymptom = () => {
    if (!newSymptom.trim()) return;

    const updated = [...symptoms, newSymptom];
    setSymptoms(updated);

    localStorage.setItem("symptoms", JSON.stringify(updated));
    setNewSymptom("");
  };

  const removeSymptom = (index) => {
    const updated = symptoms.filter((_, i) => i !== index);
    setSymptoms(updated);
    localStorage.setItem("symptoms", JSON.stringify(updated));
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "tasks", label: "Daily Task", icon: Calendar },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "report", label: "AI Report", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        Loading your health data...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-[#1FBCF9] mb-10">⚡ Arogya</h1>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  active === item.id
                    ? "bg-[#1FBCF9]/20 text-[#1FBCF9]"
                    : "hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1">

        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-800 flex items-center px-8">
          <h2 className="text-lg">
            Hi, <span className="text-[#1FBCF9] font-semibold">{data.username}</span>
          </h2>
        </header>

        <div className="p-10">

          {/* DASHBOARD */}
          {active === "dashboard" && (
            <div>
              <h1 className="text-3xl font-bold mb-8">Health Overview</h1>

              <div className="grid md:grid-cols-3 gap-6">

                <Card title="BMI" value={data.bmi} />
                <Card title="Blood Pressure" value={`${data.systolic}/${data.diastolic}`} />
                <Card title="Sleep Quality" value={data.sleepQuality} />

              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {active === "analytics" && <Analytics data={data} />}

          {/* TASKS */}
          {active === "tasks" && (
            <Placeholder title="Daily Tasks Coming Soon..." />
          )}

          {/* AI CHAT */}
          {active === "chat" && <AiChat />}

          {/* REPORT */}
          {active === "report" && (
            <Placeholder title="AI Report Coming Soon..." />
          )}

          {/* PROFILE */}
          {active === "profile" && (
            <div className="max-w-4xl mx-auto">

              <div className="bg-[#111] border border-gray-800 rounded-xl p-8 flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-[#1FBCF9] flex items-center justify-center text-3xl font-bold">
                  {data.username.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{data.username}</h2>
                  <p className="text-gray-400">Health Profile</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card title="Age" value={`${data.age} yrs`} />
                <Card title="Weight" value={`${data.weight} kg`} />
                <Card title="Height" value={`${data.height} cm`} />
                <Card title="Blood Group" value={data.bloodGroup} />
              </div>

              {/* Symptoms */}
              <div className="bg-[#111] border border-gray-800 rounded-xl p-6">

                <h3 className="text-xl font-semibold mb-4 text-[#1FBCF9]">
                  Your Symptoms
                </h3>

                <div className="flex flex-wrap gap-3 mb-4">
                  {symptoms.length === 0 && (
                    <p className="text-gray-400">No symptoms added</p>
                  )}

                  {symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
                      <span>{symptom}</span>
                      <button
                        onClick={() => removeSymptom(index)}
                        className="text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    placeholder="Add new symptom"
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />

                  <button
                    onClick={addSymptom}
                    className="bg-[#1FBCF9] px-4 rounded-lg hover:bg-[#17a4db]"
                  >
                    Add
                  </button>
                </div>

              </div>

              <button
                onClick={handleLogout}
                className="mt-8 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Logout
              </button>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* CARD */
function Card({ title, value }) {
  return (
    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 hover:border-[#1FBCF9] transition">
      <p className="text-gray-400 mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

/* PLACEHOLDER */
function Placeholder({ title }) {
  return <div className="text-gray-400 text-lg">{title}</div>;
}

/* ANALYTICS */

function ChartCard({ title, children }) {
  return (
    <div className="p-4 rounded-xl border border-gray-800 bg-[#111] hover:border-[#1FBCF9] transition">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="h-[300px]">{children}</div>
    </div>
  );
}

function Analytics({ data }) {

  const wellnessPieData = [
    { name: "Sleep", value: data.sleepQuality === "Good" ? 10 : 5 },
    { name: "Stress", value: 6 },
    { name: "Fitness", value: data.bmi < 25 ? 8 : 4 },
    { name: "Health", value: 7 },
  ];

  const moodLineData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    happiness: Math.floor(Math.random() * 4) + 6,
    stress: Math.floor(Math.random() * 4) + 3,
  }));

  const radarData = [
    { metric: "Sleep", score: data.sleepQuality === "Good" ? 9 : 5 },
    { metric: "Stress", score: 6 },
    { metric: "Fitness", score: data.bmi < 25 ? 9 : 4 },
    { metric: "Health", score: 7 },
  ];

  const barData = [
    {
      name: "User",
      Sleep: data.sleepQuality === "Good" ? 9 : 5,
      Fitness: data.bmi < 25 ? 9 : 4,
    },
  ];

  return (
    <div>

      <h2 className="text-3xl font-bold text-[#1FBCF9] mb-6">
        Health Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <ChartCard title="Wellness Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={wellnessPieData} cx="50%" cy="50%" outerRadius={80} label dataKey="value">
                {wellnessPieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mood Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodLineData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="happiness" stroke="#1FBCF9" />
              <Line type="monotone" dataKey="stress" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Health Overview">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar dataKey="score" stroke="#1FBCF9" fill="#1FBCF9" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sleep vs Fitness">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sleep" fill="#1FBCF9" />
              <Bar dataKey="Fitness" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

/* AI CHAT */

function AiChat() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("aiChatHistory");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("aiChatHistory", JSON.stringify(messages));

    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {

      const res = await axios.post("/api/v1/aichat/chat", {
        message: input,
      });

      const aiReply = {
        sender: "ai",
        message: res.data.reply || "I couldn't understand that.",
      };

      setMessages((prev) => [...prev, aiReply]);

    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", message: "Server error. Try again later." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-[#111] rounded-xl border border-gray-800">

      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1FBCF9] rounded-full flex items-center justify-center">
          🤖
        </div>

        <div>
          <p className="font-semibold">Arogya AI</p>
          <p className="text-xs text-gray-400">Your health assistant</p>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">

        {messages.length === 0 && (
          <p className="text-gray-500 text-center">
            Ask about symptoms, diet, sleep or fitness.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-xl max-w-md text-sm ${
                msg.sender === "user"
                  ? "bg-[#1FBCF9]"
                  : "bg-gray-800"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 text-sm italic">
            Arogya AI is typing...
          </div>
        )}

      </div>

      <div className="p-4 border-t border-gray-800 flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about health..."
          className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-[#1FBCF9] px-4 rounded-lg hover:bg-[#17a4db]"
        >
          <Send size={18} />
        </button>

      </div>
    </div>
  );
}

export default Dashboard;