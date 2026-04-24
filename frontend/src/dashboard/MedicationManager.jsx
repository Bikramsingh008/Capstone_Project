import { useState, useEffect } from "react";
import axios from "axios";

function MedicationManager({ data }) {
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "Daily", time: "" });
  const [loading, setLoading] = useState(false);

  const fetchMedications = async () => {
    try {
      const validId = data?._id || data?.id || "640a1b2c3d4e5f6a7b8c9d0e";
      const res = await axios.get(`http://localhost:3000/api/medications/${validId}`);
      setMedications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const addMedication = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dosage || !form.time) return;
    setLoading(true);
    try {
      const validId = data?._id || data?.id || "640a1b2c3d4e5f6a7b8c9d0e";
      await axios.post("http://localhost:3000/api/medications", { 
        ...form, 
        userId: validId, 
        email: data?.email,
        phone: data?.phone 
      });
      setForm({ name: "", dosage: "", frequency: "Daily", time: "" });
      fetchMedications();
      alert(`Medication schedule for ${form.name} saved!\nA reminder confirmation has been sent.`);
    } catch (err) {
      alert("Error adding medication");
    }
    setLoading(false);
  };

  const deleteMedication = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/medications/${id}`);
      fetchMedications();
    } catch (err) {
      alert("Error deleting medication");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* ADD MED FORM */}
      <div className="md:col-span-1 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(31,188,249,0.1)] h-fit">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-[#1FBCF9] mr-2">➕</span> Add Medication
        </h2>
        <form onSubmit={addMedication} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Medication Name</label>
            <input 
              type="text" required
              value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-black/50 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Dosage (e.g. 500mg)</label>
            <input 
              type="text" required
              value={form.dosage} onChange={(e) => setForm({...form, dosage: e.target.value})}
              className="w-full bg-black/50 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Frequency</label>
            <select 
              value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})}
              className="w-full bg-gray-900 border border-white/20 px-4 py-2 rounded-lg focus:outline-none focus:border-[#1FBCF9] text-white"
            >
              <option>Daily</option>
              <option>Twice a Day</option>
              <option>Weekly</option>
              <option>As Needed</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Time</label>
            <input 
              type="time" required
              value={form.time} onChange={(e) => setForm({...form, time: e.target.value})}
              className="w-full bg-black/50 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white"
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#1FBCF9] px-4 py-2 rounded-lg font-semibold hover:bg-[#15a0d6] transition text-white mt-4"
          >
            Add to Schedule
          </button>
        </form>
      </div>

      {/* MED LIST */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold flex items-center mb-6">
          <span className="text-[#1FBCF9] mr-2">💊</span> Your Active Prescriptions
        </h2>
        
        {medications.length === 0 ? (
          <div className="bg-white/5 p-10 rounded-2xl border border-dashed border-white/20 text-center text-gray-400">
            No active medications right now. Add one from the panel.
          </div>
        ) : (
          medications.map(med => (
            <div key={med._id} className="bg-gradient-to-r from-white/5 to-transparent p-6 rounded-2xl border border-white/10 flex justify-between items-center group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#1FBCF9]/20 flex justify-center items-center text-2xl">
                  💊
                </div>
                <div>
                  <h3 className="text-xl font-bold">{med.name} <span className="text-sm text-gray-400 font-normal ml-2">({med.dosage})</span></h3>
                  <p className="text-[#1FBCF9] text-sm mt-1">{med.frequency} at {med.time}</p>
                </div>
              </div>
              <button 
                onClick={() => deleteMedication(med._id)}
                className="opacity-0 group-hover:opacity-100 bg-red-500/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MedicationManager;
