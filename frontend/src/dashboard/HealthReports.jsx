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

  const parsePrescription = (ai_description) => {
    try {
      const parsed = JSON.parse(ai_description);
      if (parsed.summary || parsed.condition_diagnosis || parsed.doctors_notes || parsed.medications || parsed.lab_results || parsed.document_type) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  // ── NEW: Parse markdown response into the same structure as JSON ──────
  // The AI sometimes returns markdown with ### headers instead of JSON.
  // This extracts sections by header so we can render them in the nice cards.
  const parseMarkdownPrescription = (text) => {
    if (!text || typeof text !== "string") return null;

    // Quick check: does this even look like the markdown format we expect?
    if (!/###\s/.test(text) && !/\|.*\|.*\|/.test(text)) return null;

    const result = {
      summary: null,
      condition_diagnosis: null,
      doctors_notes: null,
      medications: [],
      lab_results: [],
      warnings: null,
      disclaimer: null,
    };

    // Split into sections by ### headers
    const sections = text.split(/###\s+\d*\.?\s*/).filter(Boolean);

    sections.forEach((section) => {
      const firstLineEnd = section.indexOf("\n");
      const heading = (firstLineEnd === -1 ? section : section.slice(0, firstLineEnd)).trim().toLowerCase();
      const body = firstLineEnd === -1 ? "" : section.slice(firstLineEnd + 1).trim();
      const cleanBody = cleanMarkdown(body);

      if (heading.includes("summary") || heading.includes("detailed summary")) {
        result.summary = cleanBody;
      } else if (heading.includes("condition") || heading.includes("diagnosis") || heading.includes("possible condition")) {
        result.condition_diagnosis = cleanBody;
      } else if (heading.includes("doctor") || heading.includes("notes") || heading.includes("explanation") || heading.includes("simple language")) {
        result.doctors_notes = cleanBody;
      } else if (heading.includes("lab") || heading.includes("test result") || heading.includes("values and status")) {
        // Parse markdown table
        const lines = body.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
        lines.forEach((line, idx) => {
          // Skip header row and separator row
          if (idx === 0 || /^\|[\s:|-]+\|$/.test(line)) return;
          const cells = line.split("|").map((c) => cleanMarkdown(c.trim())).filter(Boolean);
          if (cells.length >= 4) {
            result.lab_results.push({
              test_name: cells[0],
              value: cells[1],
              normal_range: cells[2],
              status: cells[3],
              interpretation: cells[4] || "",
            });
          }
        });
      } else if (heading.includes("medication") || heading.includes("prescribed")) {
        // Try to extract medications. If it just says "no medications listed", store as note instead.
        if (/no medications/i.test(body)) {
          result.medications = [];
          // Append the explanation to doctor's notes if there's room
          if (!result.doctors_notes) {
            result.doctors_notes = cleanBody;
          }
        } else {
          // Parse bullet-style medications
          const medLines = body.split(/\n\s*\*\s+/).filter(Boolean);
          medLines.forEach((line) => {
            const cleaned = cleanMarkdown(line);
            if (cleaned && cleaned.length > 3) {
              result.medications.push({
                name: cleaned.split(/[:\-—]/)[0].trim().slice(0, 60),
                purpose: cleaned,
                dosage: "",
                timing: "",
              });
            }
          });
        }
      } else if (heading.includes("safety") || heading.includes("warning") || heading.includes("red flag")) {
        result.warnings = cleanBody;
      } else if (heading.includes("disclaimer") || heading.includes("ai disclaimer")) {
        result.disclaimer = cleanBody;
      } else if (heading.includes("document type")) {
        // Skip — not displayed in the card layout
      } else if (!result.summary) {
        // Fallback: dump unrecognized first section into summary
        result.summary = cleanBody;
      }
    });

    // Handle leading text before any ### heading (intro line like "This analysis is based on...")
    const beforeFirstHeading = text.split(/###\s/)[0].trim();
    if (beforeFirstHeading && !result.summary) {
      result.summary = cleanMarkdown(beforeFirstHeading);
    } else if (beforeFirstHeading && result.summary && !result.summary.startsWith(cleanMarkdown(beforeFirstHeading).slice(0, 20))) {
      result.summary = cleanMarkdown(beforeFirstHeading) + "\n\n" + result.summary;
    }

    // Only return if we extracted at least something meaningful
    const hasContent =
      result.summary ||
      result.condition_diagnosis ||
      result.doctors_notes ||
      result.lab_results.length > 0 ||
      result.medications.length > 0 ||
      result.warnings;

    return hasContent ? result : null;
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
      window.alert("Failed to generate report: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

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
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
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
      window.alert("Failed to analyze prescription: " + (err.response?.data?.error || err.message));
    }
    setUploading(false);
  };

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("high") || s.includes("abnormal") || s.includes("low")) return "text-[#FDA4AF] drop-shadow-[0_0_5px_rgba(253,164,175,0.8)]";
    if (s.includes("normal")) return "text-[#86EFAC] drop-shadow-[0_0_5px_rgba(134,239,172,0.8)]";
    return "text-[#7DD3FC] drop-shadow-[0_0_5px_rgba(125,211,252,0.8)]";
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
          <div className="bg-gradient-to-br from-[#1FBCF9]/10 to-white/5 backdrop-blur-xl p-6 rounded-3xl border border-[#1FBCF9]/20 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-2">🧠 AI Health Analysis</h2>
            <p className="text-gray-400 mb-4 text-sm">Describe your symptoms and get AI-based insights.</p>
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

          {reports.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Recent Symptom Reports</h2>
              {reports.map((report) => (
                <div
                  key={report._id || report.id}
                  className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(31,188,249,0.2)] transition-all"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-gray-400">{new Date(report.created_at).toLocaleString()}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#1FBCF9]/20 text-[#1FBCF9]">AI Generated</span>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Symptoms</h3>
                    <p className="text-white bg-black/40 p-4 rounded-xl border border-white/10 leading-relaxed">
                      {expandedReport === report._id ? report.symptoms : `${report.symptoms.slice(0, 120)}...`}
                    </p>
                    {report.symptoms.length > 120 && (
                      <button onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)} className="text-[#1FBCF9] text-sm mt-2 hover:underline">
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
                            {parsed.normal_symptoms && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2"><span className="text-lg">🩺</span><h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Normal Symptoms</h4></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.normal_symptoms)}</p>
                              </div>
                            )}
                            {parsed.high_risks && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2"><span className="text-lg">⚠️</span><h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider">High Risk Signs</h4></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.high_risks)}</p>
                              </div>
                            )}
                            {parsed.home_remedies && (
                              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2"><span className="text-lg">🌿</span><h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Home Remedies</h4></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.home_remedies)}</p>
                              </div>
                            )}
                            {parsed.other_advice && (
                              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2"><span className="text-lg">💡</span><h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Doctor's Advice</h4></div>
                                <p className="text-gray-300 text-sm leading-relaxed">{cleanMarkdown(parsed.other_advice)}</p>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <>
                            <h3 className="text-sm text-green-400 mb-2 uppercase tracking-wider">AI Insights</h3>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-gray-200 leading-relaxed whitespace-pre-wrap">
                              {expandedAnalysis === report._id ? cleanMarkdown(report.ai_analysis) : `${cleanMarkdown(report.ai_analysis).slice(0, 200)}...`}
                            </div>
                            {report.ai_analysis.length > 200 && (
                              <button onClick={() => setExpandedAnalysis(expandedAnalysis === report._id ? null : report._id)} className="text-green-400 text-sm mt-2 hover:underline">
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
            <h2 className="text-xl font-semibold text-white mb-2">💊 AI Prescription Analyzer</h2>
            <p className="text-gray-400 mb-6 text-sm">Upload a clear photo of your prescription and let AI translate it into simple, user-friendly instructions.</p>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed ${prescriptionImage ? 'border-purple-500 bg-purple-500/5' : 'border-white/20 hover:border-purple-400 bg-black/20'} rounded-2xl p-8 text-center transition cursor-pointer relative flex flex-col items-center justify-center min-h-[200px]`}
              onClick={() => !prescriptionImage && fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" className="hidden" />
              {prescriptionImage ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  {prescriptionImage.startsWith('data:application/pdf') ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-6xl">📄</div>
                      <p className="text-sm font-medium text-purple-400">PDF Document Selected</p>
                    </div>
                  ) : (
                    <img src={prescriptionImage} alt="Prescription" className="max-h-48 rounded-xl shadow-lg border border-white/10" />
                  )}
                  <button onClick={(e) => { e.stopPropagation(); setPrescriptionImage(null); }} className="text-xs text-red-400 hover:underline">Remove File</button>
                </div>
              ) : (
                <div className="space-y-2 text-gray-400">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-medium">Click or drag & drop image/PDF</p>
                  <p className="text-xs text-gray-500">Supports JPG, PNG, PDF (Max 10MB)</p>
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

          {/* ── PRESCRIPTION HISTORY ─────────────────────────────────────── */}
          {prescriptions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Prescription History</h2>
              <div className="flex flex-col gap-8">
                {prescriptions.map((prescription) => {
                  // Try JSON first, then fall back to markdown parser
                  const parsed =
                    parsePrescription(prescription.ai_description) ||
                    parseMarkdownPrescription(prescription.ai_description);
                  return (
                    <div
                      key={prescription._id}
                      className="bg-gradient-to-b from-[#0f172a] to-[#020617] border border-slate-800/60 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                      {/* ── Rx Reader Header ── */}

                      {/* ── Scanned image ── */}
                      <div className="px-5 pt-5">
                        {prescription.image_data.startsWith('data:application/pdf') ? (
                          <div className="w-full h-52 flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                            <div className="text-5xl mb-3">📄</div>
                            <a href={prescription.image_data} target="_blank" rel="noopener noreferrer" className="text-[#1FBCF9] hover:text-[#38bdf8] transition font-medium text-sm">View Original PDF</a>
                          </div>
                        ) : (
                          <img
                            src={prescription.image_data}
                            alt="Scanned Prescription"
                            className="w-full max-h-60 object-contain rounded-2xl border border-white/10 shadow-sm bg-black/50"
                          />
                        )}
                        <p className="text-xs text-gray-500 mt-2 text-right">{new Date(prescription.created_at).toLocaleString()}</p>
                      </div>

                      {/* ── Analysis Results ── */}
                      <div className="px-5 pt-6 pb-8">
                        <h2 className="text-[22px] font-bold text-white mb-5 flex items-center gap-2">
                          <span className="text-[#1FBCF9] drop-shadow-[0_0_8px_rgba(31,188,249,0.8)]">✨</span> Analysis Results
                        </h2>

                        {parsed ? (
                          <div className="space-y-4">

                            {/* Summary — purple */}
                            {parsed.summary && (
                              <div className="bg-gradient-to-br from-[#9333EA]/10 to-transparent border border-[#9333EA]/30 rounded-2xl p-5 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[#D8B4FE] text-lg drop-shadow-[0_0_10px_rgba(216,180,254,0.8)]">📋</span>
                                  <h4 className="text-[15px] font-bold text-[#D8B4FE] tracking-wide">Summary</h4>
                                </div>
                                <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-line">{parsed.summary}</p>
                              </div>
                            )}

                            {/* Condition / Diagnosis — blue */}
                            {parsed.condition_diagnosis && (
                              <div className="bg-gradient-to-br from-[#0284C7]/10 to-transparent border border-[#0284C7]/30 rounded-2xl p-5 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[#7DD3FC] text-lg drop-shadow-[0_0_10px_rgba(125,211,252,0.8)]">🏥</span>
                                  <h4 className="text-[15px] font-bold text-[#7DD3FC] tracking-wide">Condition / Diagnosis</h4>
                                </div>
                                <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-line">{parsed.condition_diagnosis}</p>
                              </div>
                            )}

                            {/* Doctor's Notes — teal/green */}
                            {parsed.doctors_notes && (
                              <div className="bg-gradient-to-br from-[#0D9488]/10 to-transparent border border-[#0D9488]/30 rounded-2xl p-5 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[#5EEAD4] text-lg drop-shadow-[0_0_10px_rgba(94,234,212,0.8)]">☰</span>
                                  <h4 className="text-[15px] font-bold text-[#5EEAD4] tracking-wide">Doctor's Notes <span className="text-[#5EEAD4]/60 font-normal text-xs ml-1">(in simple language)</span></h4>
                                </div>
                                <p className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-line">{parsed.doctors_notes}</p>
                              </div>
                            )}

                            {/* ── Lab Test Results — red/pink ── */}
                            {parsed.lab_results && parsed.lab_results.length > 0 && (
                              <div className="bg-gradient-to-br from-[#E11D48]/10 to-transparent border border-[#E11D48]/30 rounded-2xl p-5 mt-2 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(225,29,72,0.05)]">
                                <div className="flex items-center gap-2 mb-5">
                                  <span className="text-[#FDA4AF] text-lg drop-shadow-[0_0_10px_rgba(253,164,175,0.8)]">🔬</span>
                                  <h4 className="text-[16px] font-bold text-[#FDA4AF] tracking-wide">Lab Test Results</h4>
                                </div>
                                <div className="space-y-0">
                                  {parsed.lab_results.map((result, idx) => (
                                    <div
                                      key={idx}
                                      className={`py-4 ${idx !== parsed.lab_results.length - 1 ? 'border-b border-[#E11D48]/20' : ''}`}
                                    >
                                      {/* Test name */}
                                      <p className="text-gray-100 font-bold text-[15px] mb-2">{result.test_name}</p>

                                      {/* Value | Normal row */}
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] mb-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 text-[11px] uppercase tracking-wider">Value</span>
                                          <span className="text-white font-semibold">{result.value}</span>
                                        </div>
                                        <div className="w-px h-6 bg-white/10"></div>
                                        <div className="flex flex-col">
                                          <span className="text-gray-500 text-[11px] uppercase tracking-wider">Normal</span>
                                          <span className="text-gray-400">{result.normal_range}</span>
                                        </div>
                                      </div>

                                      {/* Status */}
                                      <p className={`text-[14px] font-bold ${getStatusColor(result.status)}`}>
                                        {result.status}
                                      </p>

                                      {/* Interpretation */}
                                      {result.interpretation && (
                                        <p className="text-[13px] text-rose-200/80 mt-2 leading-relaxed bg-rose-500/10 p-3 rounded-lg border border-rose-500/10">
                                          {result.interpretation}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ── Medications ── */}
                            {parsed.medications && parsed.medications.length > 0 && (
                              <div className="mt-4">
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                  Prescribed Medications
                                </p>
                                <div className="space-y-3">
                                  {parsed.medications.map((med, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-indigo-500/30 transition-colors rounded-2xl px-5 py-4 flex justify-between items-center shadow-lg backdrop-blur-sm group">
                                      <div className="space-y-1">
                                        <p className="text-gray-100 font-bold text-[15px] group-hover:text-indigo-300 transition-colors">{med.name}</p>
                                        {med.purpose && <p className="text-gray-400 text-[13px]">{med.purpose}</p>}
                                      </div>
                                      {(med.dosage || med.timing) && (
                                        <div className="text-right shrink-0 ml-4 flex flex-col items-end">
                                          {med.dosage && <span className="bg-[#1FBCF9]/10 text-[#1FBCF9] border border-[#1FBCF9]/20 px-2.5 py-1 rounded-md font-bold text-[12px] shadow-[0_0_10px_rgba(31,188,249,0.1)]">{med.dosage}</span>}
                                          {med.timing && <p className="text-[#D8B4FE] font-medium text-[12px] mt-1.5 flex items-center gap-1.5"><span className="text-[10px]">⏱</span> {med.timing}</p>}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ── Safety Warning ── */}
                            <div className="mt-6 bg-gradient-to-br from-[#ef4444]/10 to-transparent border border-[#ef4444]/30 rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]"></div>
                              <div className="flex gap-4">
                                <span className="text-red-400 text-2xl drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">⚠️</span>
                                <div>
                                  <h6 className="text-[15px] font-bold text-red-400 mb-2 tracking-wide">Important Safety Information</h6>
                                  <p className="text-[13px] text-red-200/90 leading-relaxed italic whitespace-pre-line">
                                    {parsed.warnings || "Review this report with your healthcare provider."}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-4 leading-relaxed border-t border-red-500/20 pt-4 whitespace-pre-line">
                                    {parsed.disclaimer || "Arogya AI provides interpretations for informational purposes only. This is not a substitute for professional medical advice, diagnosis, or treatment."}
                                  </p>
                                </div>
                              </div>
                            </div>

                          </div>
                        ) : (
                          /* Fallback plain text */
                          <div className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm shadow-inner">
                            {cleanMarkdown(prescription.ai_description)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default HealthReports;