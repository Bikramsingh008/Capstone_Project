import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { jsPDF } from "jspdf";

function HealthReports({ data }) {
  const [symptoms, setSymptoms] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);

  const reportRef = useRef(null);

  const fetchReports = async () => {
    try {
      const validId = data?._id || data?.id;
      const res = await axios.get(`http://localhost:3000/api/reports/${validId}`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const generateReport = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);

    try {
      const validId = data?._id || data?.id;
      await axios.post("http://localhost:3000/api/reports", {
        userId: validId,
        symptoms
      });

      setSymptoms("");
      fetchReports();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // Chart Data
  const chartData = [
    { day: 'Mon', happiness: data.happinessLevel - 1, stress: data.stressLevel + 1 },
    { day: 'Tue', happiness: data.happinessLevel, stress: data.stressLevel },
    { day: 'Wed', happiness: data.happinessLevel + 1, stress: data.stressLevel - 1 },
    { day: 'Thu', happiness: data.happinessLevel, stress: data.stressLevel + 2 },
    { day: 'Fri', happiness: data.happinessLevel, stress: data.stressLevel },
  ];

  return (
    <div className="space-y-10">

      {/* ===== CHART CARD ===== */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#020617] p-6 rounded-3xl border border-white/10 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
          📊 Wellness Trends
        </h2>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1FBCF9' }} />
              <Line type="monotone" dataKey="happiness" stroke="#1FBCF9" strokeWidth={3} />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== INPUT CARD ===== */}
      <div className="bg-gradient-to-br from-[#1FBCF9]/10 to-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-2">
          🧠 AI Health Analysis
        </h2>

        <p className="text-gray-400 mb-4 text-sm">
          Describe your symptoms and get AI-based insights.
        </p>

        <textarea
          rows="4"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. headache, fatigue, nausea..."
          className="w-full bg-black/40 p-4 rounded-xl border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white resize-none"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-[#1FBCF9] px-6 py-2 rounded-xl font-medium hover:bg-[#0ea5e9] transition"
          >
            {loading ? "Analyzing..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* ===== REPORT CARDS ===== */}
      {reports.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Recent Reports</h2>

          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(31,188,249,0.2)] transition-all"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400">
                  {new Date(report.created_at).toLocaleString()}
                </span>

                <span className="text-xs px-3 py-1 rounded-full bg-[#1FBCF9]/20 text-[#1FBCF9]">
                  AI Generated
                </span>
              </div>

              {/* ===== SYMPTOMS ===== */}
              <div className="mb-5">
                <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                  Symptoms
                </h3>

                <p className="text-white bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed">
                  {expandedReport === report.id
                    ? report.symptoms
                    : `${report.symptoms.slice(0, 120)}...`}
                </p>

                {report.symptoms.length > 120 && (
                  <button
                    onClick={() =>
                      setExpandedReport(expandedReport === report.id ? null : report.id)
                    }
                    className="text-[#1FBCF9] text-sm mt-2 hover:underline"
                  >
                    {expandedReport === report.id ? "Show Less ▲" : "Read More ▼"}
                  </button>
                )}
              </div>

              {/* ===== AI ANALYSIS ===== */}
              <div>
                <h3 className="text-sm text-green-400 mb-2 uppercase tracking-wider">
                  AI Insights
                </h3>

                <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {expandedAnalysis === report.id
                    ? report.ai_analysis
                    : `${report.ai_analysis.slice(0, 200)}...`}
                </div>

                {report.ai_analysis.length > 200 && (
                  <button
                    onClick={() =>
                      setExpandedAnalysis(expandedAnalysis === report.id ? null : report.id)
                    }
                    className="text-green-400 text-sm mt-2 hover:underline"
                  >
                    {expandedAnalysis === report.id ? "Show Less ▲" : "Read More ▼"}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HealthReports;