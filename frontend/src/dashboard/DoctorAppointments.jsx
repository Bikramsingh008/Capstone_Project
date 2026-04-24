import { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function DoctorAppointments({ data }) {
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const slipRef = useRef(null);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          // This would ideally use a reverse-geocoding API. For now, mocking with "Current Area"
          // Let's use a free open street map reverse geocoding API
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.data && res.data.address) {
             const city = res.data.address.city || res.data.address.town || res.data.address.state || "Current Area";
             setLocation(city);
          } else {
             setLocation("Current Area");
          }
        } catch (error) {
          console.error(error);
          setLocation("Current Area");
        }
      }, () => {
        alert("Geolocation permission denied.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const searchDoctors = async () => {
    if (!location.trim()) {
      alert("Please enter a location first.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/doctors?location=${location}&specialization=${specialization}`);
      setDoctors(res.data);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const bookAppointment = async (doctor) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const time = "10:00 AM";
      await axios.post(`http://localhost:3000/api/appointments`, {
        userId: data?._id || data?.id,
        email: data?.email,
        phone: data?.phone,
        doctorId: doctor._id || doctor.id,
        doctorName: doctor.name,
        date,
        time
      });
      setBookedAppointment({ ...doctor, date, time, patientName: data?.username || 'Guest' });
    } catch (err) {
      alert("Error booking appointment");
    }
  };

  const downloadSlip = async () => {
    if (!slipRef.current) return;
    
    slipRef.current.classList.add("bg-white", "text-black");
    slipRef.current.classList.remove("text-white");
    
    const canvas = await html2canvas(slipRef.current, { scale: 2 });
    
    slipRef.current.classList.remove("bg-white", "text-black");
    slipRef.current.classList.add("text-white");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a5");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Appointment_Slip_${bookedAppointment.name.replace(/ /g, '_')}.pdf`);
  };

  if (bookedAppointment) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6">
        <div 
          ref={slipRef}
          className="bg-black/80 backdrop-blur-md p-10 rounded-2xl border-2 border-[#1FBCF9] w-full max-w-lg shadow-[0_0_50px_rgba(31,188,249,0.3)] text-white relative"
        >
          <div className="text-center border-b border-gray-600 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-[#1FBCF9]">Arogya Health</h1>
            <p className="text-sm text-gray-400 mt-1">Confirmed Appointment Slip</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Patient Name:</span>
              <span className="font-bold">{bookedAppointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Doctor:</span>
              <span className="font-bold">{bookedAppointment.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Specialization:</span>
              <span className="font-bold text-[#1FBCF9]">{bookedAppointment.specialization}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Date & Time:</span>
              <span className="font-bold">{bookedAppointment.date} at {bookedAppointment.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Clinic/Hospital:</span>
              <span className="font-bold text-right pl-4">{bookedAppointment.address}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-600 text-center text-xs text-gray-500">
            <p>Please arrive 15 minutes prior to your appointment time.</p>
            <p>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => setBookedAppointment(null)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
          >
            ← Back to Doctors
          </button>
          <button 
            onClick={downloadSlip}
            className="px-6 py-3 bg-[#1FBCF9] hover:bg-blue-600 rounded-lg text-white font-medium transition"
          >
            📥 Download Slip (PDF)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Book a Doctor Appointment</h2>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="flex flex-1 space-x-2">
           <input 
             type="text"
             value={location}
             onChange={(e) => setLocation(e.target.value)}
             placeholder="Location (e.g., New York)"
             className="w-full bg-white/10 px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-[#1FBCF9] text-white"
           />
           <button 
             onClick={handleDetectLocation}
             className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition"
             title="Detect My Location"
           >
             📍
           </button>
        </div>
        <input 
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="Specialization (from AI Chat)"
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
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#1FBCF9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !hasSearched ? (
        <div className="bg-white/5 p-10 rounded-2xl border border-dashed border-white/20 text-center text-gray-400">
          <span className="text-4xl mb-4 block">👨‍⚕️</span>
          Use the AI Chat to get a specialization recommendation based on your symptoms, then search for local doctors here.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {doctors.map(doctor => (
            <div key={doctor._id || doctor.id} className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
              <img src={doctor.image_url} alt={doctor.name} className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-[#1FBCF9]"/>
              <h3 className="text-xl font-bold">{doctor.name}</h3>
              <p className="text-[#1FBCF9] mb-2">{doctor.specialization}</p>
              <div className="text-gray-400 text-sm mb-4 space-y-1">
                <p>📍 {doctor.location} - {doctor.address}</p>
                <p>📞 {doctor.phone}</p>
                <p>⭐ {doctor.rating}/5.0</p>
              </div>
              <button 
                onClick={() => bookAppointment(doctor)}
                className="w-full bg-[#1FBCF9]/20 text-[#1FBCF9] py-2 rounded-lg hover:bg-[#1FBCF9] hover:text-white transition"
              >
                Book Appointment
              </button>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="col-span-1 md:col-span-2 bg-red-500/10 p-6 rounded-xl border border-red-500/20 text-center text-red-400">
               No doctors found matching your criteria. Try loosening your search filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
