import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function HealthReports({ data }) {
  const [symptoms, setSymptoms] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/reports/${data?.id || 1}`); 
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
      await axios.post("http://localhost:3000/api/reports", {
        userId: data?.id || 1,
        symptoms
      });
      setSymptoms("");
      fetchReports();
    } catch (err) {
      alert("Failed to generate report.");
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    // add temporary class to force white background for PDF rendering because text is white
    reportRef.current.classList.add("bg-gray-900", "p-8", "text-white");
    
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    
    reportRef.current.classList.remove("bg-gray-900", "p-8", "text-white");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("AI-Health-Report.pdf");
    alert("PDF Downloaded Successfully!");
  };

  // Mock past stats based on data object
  const chartData = [
    { day: 'Mon', happiness: data.happinessLevel - 1, stress: data.stressLevel + 1 },
    { day: 'Tue', happiness: data.happinessLevel, stress: data.stressLevel },
    { day: 'Wed', happiness: data.happinessLevel + 1, stress: data.stressLevel - 1 },
    { day: 'Thu', happiness: data.happinessLevel, stress: data.stressLevel + 2 },
    { day: 'Fri', happiness: data.happinessLevel, stress: data.stressLevel },
  ];

  return (
    <div className="space-y-10">
      
      {/* Chart Section */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(31,188,249,0.1)]">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="text-[#1FBCF9] mr-2">📊</span> Your Wellness Trends
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#a0aec0" />
              <YAxis stroke="#a0aec0" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1FBCF9' }} />
              <Line type="monotone" dataKey="happiness" stroke="#1FBCF9" strokeWidth={3} />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Generation Section */}
      <div className="bg-gradient-to-br from-[#1FBCF9]/20 to-white/5 p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(31,188,249,0.15)]">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <span className="text-[#1FBCF9] mr-2">🔍</span> AI Health Analysis
        </h2>
        <p className="text-gray-300 mb-4">Input your current symptoms below, and our AI will generate a detailed health report with recommendations.</p>
        
        <textarea
          rows="4"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. I have a mild headache, feeling very tired, and slightly nauseous since yesterday..."
          className="w-full bg-black/50 p-4 rounded-xl border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white mb-4 resize-none"
        ></textarea>
        
        <div className="flex justify-end">
          <button 
            onClick={generateReport}
            disabled={loading}
            className="bg-[#1FBCF9] px-6 py-2 rounded-lg font-semibold hover:bg-[#15a0d6] transition disabled:opacity-50 flex items-center"
          >
            {loading ? "Analyzing..." : "Generate AI Report"}
          </button>
        </div>
      </div>

      {/* Historical Reports */}
      {reports.length > 0 && (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Reports</h2>
            <button 
              onClick={downloadPDF}
              className="bg-transparent border border-[#1FBCF9] text-[#1FBCF9] hover:bg-[#1FBCF9] hover:text-white px-4 py-2 rounded-lg transition"
            >
              📥 Download PDF
            </button>
          </div>
          
          <div ref={reportRef} className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-black/40 p-6 rounded-xl border border-white/5 relative">
                <div className="absolute top-4 right-4 text-xs text-gray-500">
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
                <h3 className="font-semibold text-[#1FBCF9] mb-2 uppercase tracking-wider text-sm">Symptoms Logged</h3>
                <p className="text-gray-300 mb-4 bg-white/5 p-3 rounded-lg border border-white/10">{report.symptoms}</p>
                
                <h3 className="font-semibold text-green-400 mb-2 uppercase tracking-wider text-sm">AI Analysis & Recommendations</h3>
                <div className="text-gray-300 whitespace-pre-wrap">{report.ai_analysis}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthReports;
