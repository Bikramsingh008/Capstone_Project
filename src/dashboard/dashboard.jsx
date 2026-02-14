import { useEffect, useState } from "react";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("patientData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []); 
  if (!data) return <h2 className="text-white text-center mt-20">No Data Found</h2>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Patient Dashboard
      </h1>

      <div className="max-w-3xl mx-auto bg-[#111] p-6 rounded-lg shadow-lg space-y-4">
        <p><strong>Gender:</strong> {data.gender}</p>
        <p><strong>Age:</strong> {data.age}</p>
        <p><strong>Weight:</strong> {data.weight} kg</p>
        <p><strong>Height:</strong> {data.height} cm</p>
        <p><strong>Blood Group:</strong> {data.blodGroup}</p>
      </div>
    </div>
  );
}

export default Dashboard;
