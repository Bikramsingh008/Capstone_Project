import { useState, useEffect, useRef } from "react";
import axios from "axios";


function HealthReports({ data }) {
  // Tabs State
  const [activeTab, setActiveTab] = useState('symptoms');

  // Symptoms State
  const [symptoms, setSymptoms] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);

  // Prescription State
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [expandedPrescription, setExpandedPrescription] = useState(null);
  
  const fileInputRef = useRef(null);

  const cleanMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/`/g, "")
      .trim();
  };

  const parseAnalysis = (ai_analysis) => {
    try {
      const parsed = JSON.parse(ai_analysis);
      if (parsed.normal_symptoms || parsed.high_risks || parsed.home_remedies || parsed.other_advice) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchReports = async () => {
    try {
      const validId = data?._id || data?.id;
      const res = await axios.get(`http://localhost:3000/api/reports/${validId}`);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const validId = data?._id || data?.id;
      const res = await axios.get(`http://localhost:3000/api/prescriptions/${validId}`);
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchPrescriptions();
  }, [data]);

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

  // Drag and Drop Logic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrescriptionImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadPrescription = async () => {
    if (!prescriptionImage) return;
    setUploading(true);
    try {
      const validId = data?._id || data?.id;
      await axios.post("http://localhost:3000/api/prescriptions", {
        userId: validId,
        imageData: prescriptionImage
      });
      setPrescriptionImage(null);
      fetchPrescriptions();
    } catch (err) {
      console.error("Prescription upload error", err);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-10">

      {/* ===== TABS ===== */}
      <div className="flex space-x-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('symptoms')}
          className={`px-6 py-2 rounded-xl font-medium transition ${activeTab === 'symptoms' ? 'bg-[#1FBCF9] text-white shadow-[0_0_20px_rgba(31,188,249,0.3)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          🧠 Symptom Checker
        </button>
        <button
          onClick={() => setActiveTab('prescription')}
          className={`px-6 py-2 rounded-xl font-medium transition ${activeTab === 'prescription' ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          💊 Prescription Analyzer
        </button>
      </div>

      {/* ===== TAB CONTENT: SYMPTOMS ===== */}
      {activeTab === 'symptoms' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* INPUT CARD */}
          <div className="bg-gradient-to-br from-[#1FBCF9]/10 to-white/5 backdrop-blur-xl p-6 rounded-3xl border border-[#1FBCF9]/20 shadow-lg">
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
                className="bg-[#1FBCF9] px-6 py-2 rounded-xl font-medium hover:bg-[#0ea5e9] transition text-white"
              >
                {loading ? "Analyzing..." : "Generate Report"}
              </button>
            </div>
          </div>

          {/* REPORT CARDS */}
          {reports.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Recent Symptom Reports</h2>
              {reports.map((report) => (
                <div
                  key={report._id || report.id}
                  className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(31,188,249,0.2)] transition-all"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-400">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#1FBCF9]/20 text-[#1FBCF9]">
                      AI Generated
                    </span>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Symptoms</h3>
                    <p className="text-white bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed">
                      {expandedReport === report._id
                        ? report.symptoms
                        : `${report.symptoms.slice(0, 120)}...`}
                    </p>
                    {report.symptoms.length > 120 && (
                      <button
                        onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                        className="text-[#1FBCF9] text-sm mt-2 hover:underline"
                      >
                        {expandedReport === report._id ? "Show Less ▲" : "Read More ▼"}
                      </button>
                    )}
                  </div>

                  <div>
                    {(() => {
                      const parsed = parseAnalysis(report.ai_analysis);
                      if (parsed) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {/* Normal Symptoms - Blue */}
                            {parsed.normal_symptoms && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🩺</span>
                                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Normal Symptoms</h4>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.normal_symptoms)}</p>
                              </div>
                            )}
                            {/* High Risks - Red */}
                            {parsed.high_risks && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">⚠️</span>
                                  <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">High Risk Signs</h4>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.high_risks)}</p>
                              </div>
                            )}
                            {/* Home Remedies - Green */}
                            {parsed.home_remedies && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🌿</span>
                                  <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Home Remedies</h4>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.home_remedies)}</p>
                              </div>
                            )}
                            {/* Other Advice - Purple */}
                            {parsed.other_advice && (
                              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">💡</span>
                                  <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Doctor's Advice</h4>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.other_advice)}</p>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // Fallback for old plain-text reports
                        return (
                          <>
                            <h3 className="text-sm text-green-400 mb-2 uppercase tracking-wider">AI Insights</h3>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {expandedAnalysis === report._id
                                ? cleanMarkdown(report.ai_analysis)
                                : `${cleanMarkdown(report.ai_analysis).slice(0, 200)}...`}
                            </div>
                            {report.ai_analysis.length > 200 && (
                              <button
                                onClick={() => setExpandedAnalysis(expandedAnalysis === report._id ? null : report._id)}
                                className="text-green-400 text-sm mt-2 hover:underline"
                              >
                                {expandedAnalysis === report._id ? "Show Less ▲" : "Read More ▼"}
                              </button>
                            )}
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB CONTENT: PRESCRIPTION ===== */}
      {activeTab === 'prescription' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* UPLOAD CARD */}
          <div className="bg-gradient-to-br from-purple-500/10 to-white/5 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/20 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              💊 AI Prescription Analyzer
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Upload a clear photo of your prescription and let AI translate it into simple, user-friendly instructions.
            </p>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed ${prescriptionImage ? 'border-purple-500 bg-purple-500/5' : 'border-white/20 hover:border-purple-400 bg-black/20'} rounded-2xl p-8 text-center transition cursor-pointer relative flex flex-col items-center justify-center min-h-[200px]`}
              onClick={() => !prescriptionImage && fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              {prescriptionImage ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <img src={prescriptionImage} alt="Prescription" className="max-h-48 rounded-xl shadow-lg border border-white/10" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPrescriptionImage(null); }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-gray-400">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-medium">Click or drag & drop an image</p>
                  <p className="text-xs text-gray-500">Supports JPG, PNG (Max 10MB)</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={uploadPrescription}
                disabled={uploading || !prescriptionImage}
                className={`px-6 py-2 rounded-xl font-medium transition text-white ${uploading || !prescriptionImage ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'}`}
              >
                {uploading ? "Analyzing Image..." : "Analyze Prescription"}
              </button>
            </div>
          </div>

          {/* PRESCRIPTION HISTORY */}
          {prescriptions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Prescription History</h2>
              <div className="flex flex-col gap-8">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    className="bg-gradient-to-br from-purple-900/20 to-white/5 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-xl hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-all overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-base font-semibold text-white">Prescription Analysis</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(prescription.created_at).toLocaleString()}</p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-medium">
                        💊 AI Interpreted
                      </span>
                    </div>

                    {/* Image */}
                    <div className="px-6 pt-5">
                      <img
                        src={prescription.image_data}
                        alt="Scanned Prescription"
                        className="w-full max-h-72 object-contain rounded-2xl border border-white/10 shadow-md bg-black/30"
                      />
                    </div>

                    {/* AI Description */}
                    <div className="px-6 py-5">
                      <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3">AI Breakdown</h4>
                      <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/40 scrollbar-track-transparent">
                        <p className="text-gray-200 text-base leading-8 whitespace-pre-wrap">
                          {cleanMarkdown(prescription.ai_description)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default HealthReports;