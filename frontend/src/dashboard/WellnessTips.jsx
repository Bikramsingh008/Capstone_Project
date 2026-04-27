import { useState, useEffect } from "react";
import axios from "axios";

function WellnessTips() {
  const [allTips, setAllTips] = useState([]);
  const [visibleTips, setVisibleTips] = useState([]);
  const [windowIndex, setWindowIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(true);

  // Fetch all tips once
  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/wellness");
        setAllTips(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTips();
  }, []);

  // Update visible window of 5 tips every 10 minutes with fade animation
  useEffect(() => {
    if (allTips.length === 0) return;

    const updateTips = (idx) => {
      setFade(false); // fade out
      setTimeout(() => {
        const start = (idx * 5) % allTips.length;
        const next = [];
        for (let i = 0; i < 5; i++) {
          next.push(allTips[(start + i) % allTips.length]);
        }
        setVisibleTips(next);
        setFade(true); // fade in
      }, 400);
    };

    // Show initial tips
    updateTips(0);

    // Rotate every 10 minutes
    const interval = setInterval(() => {
      setWindowIndex((prev) => {
        const next = prev + 1;
        updateTips(next);
        return next;
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [allTips]);

  if (loading) return <div className="text-gray-400">Loading wellness advice...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#1FBCF9]/20 p-6 rounded-2xl border border-[#1FBCF9]/30 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <span className="text-red-500 mr-3">❤️</span> Daily Wellness Tips
          </h2>
          <p className="text-gray-300">Expert advice curated to maintain and improve your holistic health.</p>
        </div>
        <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full mt-2 whitespace-nowrap">
          🔄 Updates every 10 min
        </span>
      </div>

      <div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {visibleTips.map((tip) => (
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
