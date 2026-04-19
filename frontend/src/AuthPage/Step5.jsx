import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Step5() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2000); // 2 secoznds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-black relative overflow-hidden">

      {/* Animated Glow Circle */}
      <div className="absolute w-72 h-72 bg-[#1FBCF9] rounded-full blur-3xl opacity-30 animate-pulse"></div>

      {/* Center Animation Dot */}
      <div className="w-6 h-6 bg-[#1FBCF9] rounded-full animate-ping"></div>

    </div>
  );
}
