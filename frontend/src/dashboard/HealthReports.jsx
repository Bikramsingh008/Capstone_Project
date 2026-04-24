import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function HealthReports({ data }) {
  const [symptoms, setSymptoms] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef(null);

  const fetchReports = async () => {
    try {
      const validId = data?._id || data?.id || "640a1b2c3d4e5f6a7b8c9d0e";
      const res = await axios.get(`http://localhost:3000/api/reports/${validId}`); 
      setReports(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const generateReport = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const validId = data?._id || data?.id || "640a1b2c3d4e5f6a7b8c9d0e";
      await axios.post("http://localhost:3000/api/reports", {
        userId: validId,
        symptoms
      });
      setSymptoms("");
      const updatedReports = await fetchReports();
      if (updatedReports.length > 0) {
        downloadPDF(updatedReports[0]);
      }
    } catch (err) {
      console.error("Report generation error:", err);
      alert("Failed to generate report: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const downloadPDF = (reportToDownload = null) => {
    try {
      const report = reportToDownload || reports[0];
      
      if (!report) {
        alert("No report available to download.");
        return;
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Colors
      const primaryColor = [31, 188, 249];
      const darkBg = [17, 24, 39];
      const textDark = [50, 50, 50];
      const textLight = [100, 100, 100];
      const borderGray = [220, 220, 220];

      let cursorY = 0;

      // 1. Header Background
      pdf.setFillColor(...darkBg);
      pdf.rect(0, 0, pageWidth, 40, "F");

      // 2. Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("AROGYA HEALTHCARE", 20, 22);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.setTextColor(...primaryColor);
      pdf.text("AI CLINICAL ASSESSMENT REPORT", 20, 32);

      cursorY = 50;

      // 3. Info Box
      pdf.setFillColor(245, 247, 250);
      pdf.rect(20, cursorY, pageWidth - 40, 25, "F");
      pdf.setDrawColor(...borderGray);
      pdf.setLineWidth(0.5);
      pdf.rect(20, cursorY, pageWidth - 40, 25, "S");

      pdf.setFontSize(10);
      pdf.setTextColor(...textLight);
      
      pdf.text("Report ID:", 25, cursorY + 8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textDark);
      const mockReportId = `RPT-${new Date(report.created_at).getTime().toString().slice(-6)}`;
      pdf.text(mockReportId, 45, cursorY + 8);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textLight);
      pdf.text("Date:", 140, cursorY + 8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textDark);
      pdf.text(new Date(report.created_at).toLocaleDateString(), 152, cursorY + 8);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textLight);
      pdf.text("Patient ID:", 25, cursorY + 18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textDark);
      pdf.text(`USR-${report.user_id || data?.id || "GUEST"}`, 45, cursorY + 18);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...textLight);
      pdf.text("Time:", 140, cursorY + 18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...textDark);
      pdf.text(new Date(report.created_at).toLocaleTimeString(), 152, cursorY + 18);

      cursorY += 40;

      // 4. Chief Complaint Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...darkBg);
      pdf.text("1. Chief Complaint (Symptoms Logged)", 20, cursorY);
      
      // Underline
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, cursorY + 2, 110, cursorY + 2);

      cursorY += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...textDark);
      const symptomsLines = pdf.splitTextToSize(report.symptoms, pageWidth - 40);
      pdf.text(symptomsLines, 20, cursorY);
      cursorY += (symptomsLines.length * 6) + 15;

      // 5. AI Assessment Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...darkBg);
      pdf.text("2. AI Clinical Assessment & Recommendations", 20, cursorY);
      
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(20, cursorY + 2, 130, cursorY + 2);

      cursorY += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...textDark);
      
      // Clean up markdown asterisks for a cleaner PDF
      const analysisText = report.ai_analysis || "";
      const cleanedAnalysis = analysisText.replace(/\*\*/g, '');
      
      const analysisLines = pdf.splitTextToSize(cleanedAnalysis, pageWidth - 40);
      
      for (let i = 0; i < analysisLines.length; i++) {
        if (cursorY > pageHeight - 35) {
          // Add footer to current page before switching
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: "center" });
          
          pdf.addPage();
          cursorY = 20;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          pdf.setTextColor(...textDark);
        }
        pdf.text(analysisLines[i], 20, cursorY);
        cursorY += 6;
      }

      // 6. Footer Disclaimer
      if (cursorY > pageHeight - 35) {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        pdf.addPage();
        cursorY = 20;
      }
      
      cursorY += 10;
      pdf.setDrawColor(...borderGray);
      pdf.setLineWidth(0.5);
      pdf.line(20, cursorY, pageWidth - 20, cursorY);
      cursorY += 6;
      
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "italic");
      const disclaimer = "DISCLAIMER: This report is generated by the Arogya AI Assistant for informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.";
      const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
      pdf.text(disclaimerLines, 20, cursorY);
      
      // Page number for final page
      pdf.setFont("helvetica", "normal");
      pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth / 2, pageHeight - 10, { align: "center" });

      // Build specific filename
      const safeDate = new Date(report.created_at).toISOString().split('T')[0];
      pdf.save(`Arogya-Health-Report_${safeDate}.pdf`);
    } catch (err) {
      console.error("Error generating PDF: ", err);
      alert("Error generating PDF: " + err.message);
    }
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
                  {new Date(report.created_at).toLocaleString()}
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
