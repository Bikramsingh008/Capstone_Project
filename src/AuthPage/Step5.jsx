import { useNavigate } from "react-router-dom";

export default function Step5() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white space-y-6">
      <h2 className="text-2xl font-bold">Profile Completed 🎉</h2>

      <button
        onClick={() => navigate("/dashboard")}
        className="bg-[#1FBCF9] px-6 py-2 rounded"
      >
        Go To Dashboard →
      </button>
    </div>
  );
}
