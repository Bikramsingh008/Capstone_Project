import { useState, useEffect } from "react";
import axios from "axios";

function WellnessTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/wellness");
        setTips(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTips();
  }, []);

  if (loading) return <div className="text-gray-400">Loading wellness advice...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#1FBCF9]/20 p-6 rounded-2xl border border-[#1FBCF9]/30">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <span className="text-red-500 mr-3">❤️</span> Daily Wellness Tips
        </h2>
        <p className="text-gray-300">Expert advice curated to maintain and improve your holistic health.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip) => (
          <div key={tip.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(31,188,249,0.05)] hover:bg-white/10 transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{tip.icon}</div>
            <p className="text-[#1FBCF9] text-sm uppercase tracking-widest font-semibold mb-2">{tip.category}</p>
            <h3 className="text-xl font-bold mb-3">{tip.title}</h3>
            <p className="text-gray-400 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WellnessTips;
