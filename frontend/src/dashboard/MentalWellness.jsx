import { useState, useEffect } from "react";
import axios from "axios";

function MentalWellness({ data }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    mood: "Happy",
    stressLevel: 5,
    energyLevel: 5,
    sleepQuality: "Good",
    journalEntry: ""
  });

  const moods = ["Happy", "Neutral", "Sad", "Anxious", "Stressed", "Calm"];
  const sleepQualities = ["Excellent", "Good", "Fair", "Poor", "Terrible"];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
       const res = await axios.get(`http://localhost:3000/api/wellness-checkin/${data?._id || data?.id || 1}`);
       setRecords(res.data);
    } catch (err) {
       console.error("Error fetching mental wellness records", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/wellness-checkin', {
          userId: data?._id || data?.id || 1,
          ...form
      });
      alert("Wellness Check-in Saved!");
      setForm({ mood: "Happy", stressLevel: 5, energyLevel: 5, sleepQuality: "Good", journalEntry: "" });
      fetchRecords();
    } catch (err) {
      alert("Error saving check-in.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
       <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-[#1FBCF9]">Mental Wellness Daily Check-in</h2>
       
       <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
             <h3 className="text-xl font-bold mb-4">Log Today's Reality</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-gray-400 mb-1">How are you feeling?</label>
                   <select 
                     value={form.mood} 
                     onChange={(e) => setForm({...form, mood: e.target.value})}
                     className="w-full bg-black/60 border border-white/20 rounded p-2 text-white"
                   >
                     {moods.map(m => <option key={m}>{m}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-gray-400 mb-1">Stress Level (1-10): {form.stressLevel}</label>
                   <input 
                     type="range" min="1" max="10" 
                     value={form.stressLevel}
                     onChange={(e) => setForm({...form, stressLevel: Number(e.target.value)})}
                     className="w-full"
                   />
                </div>
                <div>
                   <label className="block text-gray-400 mb-1">Energy Level (1-10): {form.energyLevel}</label>
                   <input 
                     type="range" min="1" max="10" 
                     value={form.energyLevel}
                     onChange={(e) => setForm({...form, energyLevel: Number(e.target.value)})}
                     className="w-full"
                   />
                </div>
                <div>
                   <label className="block text-gray-400 mb-1">Sleep Quality</label>
                   <select 
                     value={form.sleepQuality} 
                     onChange={(e) => setForm({...form, sleepQuality: e.target.value})}
                     className="w-full bg-black/60 border border-white/20 rounded p-2 text-white"
                   >
                     {sleepQualities.map(m => <option key={m}>{m}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-gray-400 mb-1">Journal Entry (Optional)</label>
                   <textarea
                     value={form.journalEntry}
                     onChange={(e) => setForm({...form, journalEntry: e.target.value})}
                     rows="3"
                     className="w-full bg-black/60 border border-white/20 rounded p-2 text-white placeholder-gray-500"
                     placeholder="Write your thoughts here..."
                   ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-[#1FBCF9] text-white p-3 rounded font-bold hover:opacity-90 transition"
                >
                  {loading ? "Saving..." : "Save Check-in"}
                </button>
             </form>
          </div>

          <div className="space-y-4">
             <h3 className="text-xl font-bold">Past Chronicles</h3>
             {records.length === 0 ? (
               <p className="text-gray-400 italic">No check-ins yet. Start tracking your wellness!</p>
             ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                   {records.map(record => (
                     <div key={record._id || Math.random()} className="bg-black/40 border border-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-bold text-[#1FBCF9]">{new Date(record.createdAt).toLocaleDateString()}</span>
                           <span className={`px-2 py-1 text-xs rounded font-bold ${record.riskScore > 10 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                              Risk Score: {record.riskScore}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                           <p>Mood: {record.mood}</p>
                           <p>Stress: {record.stressLevel}/10</p>
                           <p>Energy: {record.energyLevel}/10</p>
                           <p>Sleep: {record.sleepQuality}</p>
                        </div>
                        {record.journalEntry && (
                           <div className="mt-2 bg-white/5 p-2 rounded text-sm italic text-gray-400">
                             "{record.journalEntry}"
                           </div>
                        )}
                     </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
}

export default MentalWellness;
