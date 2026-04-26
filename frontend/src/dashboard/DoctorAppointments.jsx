import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function DoctorAppointments({ data }) {
  const [location, setLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const slipRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = sessionStorage.getItem("adminUser") !== null;

  // Helper to check if a date is available
  const isDateAvailable = (dateStr, doctor) => {
    if (!doctor || !doctor.availability) return false;
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if doctor works on this day
    const worksOnDay = doctor.availability.includes(dayName);
    // Check if already booked (unavailableDates)
    const isBooked = doctor.unavailableDates && doctor.unavailableDates.includes(dateStr);
    
    return worksOnDay && !isBooked;
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
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

  const confirmBooking = async () => {
    if (!selectedDate) {
        alert("Please select an available date from the calendar.");
        return;
    }
    try {
      const time = "10:00 AM"; // Default time for demo
      await axios.post(`http://localhost:3000/api/appointments`, {
        userId: data?._id || data?.id,
        patientName: data?.username,
        email: data?.email,
        phone: data?.phone,
        doctorId: selectedDoctor._id || selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        time
      });
      setBookedAppointment({ ...selectedDoctor, date: selectedDate, time, patientName: data?.username || 'Guest' });
      setSelectedDoctor(null);
      setSelectedDate("");
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

  // Calendar View for Selected Doctor
  if (selectedDoctor) {
      const today = new Date();
      const dates = [];
      for (let i = 0; i < 14; i++) {
          const d = new Date();
          d.setDate(today.getDate() + i);
          dates.push(d.toISOString().split('T')[0]);
      }

      return (
          <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
              <button onClick={() => setSelectedDoctor(null)} className="text-[#1FBCF9] mb-6 hover:underline flex items-center">
                  ← Back to results
              </button>
              
              <div className="flex items-center gap-6 mb-10 pb-6 border-b border-white/10">
                  <img src={selectedDoctor.image_url} className="w-24 h-24 rounded-full border-4 border-[#1FBCF9]"/>
                  <div>
                      <h2 className="text-3xl font-bold">{selectedDoctor.name}</h2>
                      <p className="text-gray-400">{selectedDoctor.specialization}</p>
                      <p className="text-sm text-[#1FBCF9] mt-1">📍 {selectedDoctor.address}</p>
                  </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Select Appointment Date</h3>
              <p className="text-sm text-gray-400 mb-6">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span> Available
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full ml-4 mr-2"></span> Unavailable/Booked
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-10">
                  {dates.map(date => {
                      const isAvailable = isDateAvailable(date, selectedDoctor);
                      const isSelected = selectedDate === date;
                      return (
                          <button
                              key={date}
                              disabled={!isAvailable}
                              onClick={() => setSelectedDate(date)}
                              className={`p-4 rounded-xl border-2 transition flex flex-col items-center ${
                                  !isAvailable 
                                    ? 'bg-red-500/10 border-red-500/30 text-red-500 cursor-not-allowed opacity-50' 
                                    : isSelected 
                                        ? 'bg-[#1FBCF9] border-[#1FBCF9] text-white scale-105 shadow-lg' 
                                        : 'bg-green-500/10 border-green-500/30 text-green-500 hover:border-green-500'
                              }`}
                          >
                              <span className="text-xs uppercase font-bold">
                                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="text-lg font-bold">
                                  {new Date(date).getDate()}
                              </span>
                              <span className="text-[10px]">
                                  {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                          </button>
                      );
                  })}
              </div>

              <button
                  onClick={confirmBooking}
                  className="w-full bg-[#1FBCF9] py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-[0_0_30px_rgba(31,188,249,0.3)]"
              >
                  Confirm Appointment
              </button>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Book a Doctor Appointment</h2>
        <button 
          onClick={() => navigate("/admin/dashboard")}
          className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition flex items-center gap-2 text-[#1FBCF9]"
        >
          🔐 Admin Portal
        </button>
      </div>
      
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
              <p className="text-[#1FBCF9] mb-1">{doctor.specialization}</p>
              <div className="text-gray-400 text-sm mb-4 space-y-1">
                <p>📍 {doctor.location} - {doctor.address}</p>
                <p>📧 {doctor.email}</p>
                <p>📞 {doctor.phone}</p>
                <p>⭐ {doctor.rating}/5.0</p>
                <p className="text-[#1FBCF9] font-medium">🕒 Available: {doctor.availability.join(', ')}</p>
              </div>
              <button 
                onClick={() => setSelectedDoctor(doctor)}
                className="w-full bg-[#1FBCF9]/20 text-[#1FBCF9] py-2 rounded-lg hover:bg-[#1FBCF9] hover:text-white transition"
              >
                View Calendar & Book
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
