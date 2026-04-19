import { useState, useEffect } from "react";
import axios from "axios";

function DoctorAppointments({ data }) {
  const [location, setLocation] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/doctors?location=${location}`);
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchDoctors();
  }, []);

  const bookAppointment = async (doctorId, doctorName) => {
    try {
      await axios.post(`http://localhost:3000/api/appointments`, {
        userId: data?.id || 1,
        email: data?.email,
        phone: data?.phone,
        doctorId,
        doctorName,
        date: new Date().toISOString().split('T')[0],
        time: "10:00 AM"
      });
      alert(`Appointment booked successfully with ${doctorName}!\nA confirmation email has been sent.`);
    } catch (err) {
      alert("Error booking appointment");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Book a Doctor Appointment</h2>
      
      <div className="flex space-x-4 mb-6">
        <input 
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your location (e.g., New York)"
          className="flex-1 bg-white/10 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white"
        />
        <button 
          onClick={searchDoctors}
          className="bg-[#1FBCF9] px-6 py-2 rounded-lg font-semibold hover:bg-[#15a0d6] transition"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {doctors.map(doctor => (
            <div key={doctor.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <img src={doctor.image_url} alt={doctor.name} className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-[#1FBCF9]"/>
              <h3 className="text-xl font-bold">{doctor.name}</h3>
              <p className="text-[#1FBCF9] mb-2">{doctor.specialization}</p>
              <div className="text-gray-400 text-sm mb-4 space-y-1">
                <p>📍 {doctor.location} - {doctor.address}</p>
                <p>📞 {doctor.phone}</p>
                <p>⭐ {doctor.rating}/5.0</p>
              </div>
              <button 
                onClick={() => bookAppointment(doctor.id, doctor.name)}
                className="w-full bg-[#1FBCF9]/20 text-[#1FBCF9] py-2 rounded-lg hover:bg-[#1FBCF9] hover:text-white transition"
              >
                Book Appointment
              </button>
            </div>
          ))}
          {doctors.length === 0 && <p className="text-gray-400 col-span-2 text-center py-10">No doctors found in this location.</p>}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
