import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../LandingPage/Navbar';

const AdminDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'appointments'
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        location: '',
        phone: '',
        address: '',
        rating: 4.5,
        email: '',
        image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80',
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
    const navigate = useNavigate();

    useEffect(() => {
        const admin = sessionStorage.getItem('adminUser');
        if (!admin) {
            navigate('/admin/login');
            return;
        }
        fetchDoctors();
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/admin/appointments');
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/admin/doctors');
            setDoctors(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                await axios.put(`http://localhost:3000/api/admin/doctors/${editingDoctor._id}`, formData);
                alert('Doctor updated successfully');
            } else {
                await axios.post('http://localhost:3000/api/admin/doctors', formData);
                alert('Doctor added successfully');
            }
            setShowModal(false);
            setEditingDoctor(null);
            setFormData({
                name: '', specialization: '', location: '', phone: '', address: '',
                rating: 4.5, email: '', image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80',
                availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            });
            fetchDoctors();
        } catch (err) {
            alert('Error saving doctor');
        }
    };

    const deleteDoctor = async (id) => {
        if (window.confirm('Are you sure you want to remove this doctor?')) {
            try {
                await axios.delete(`http://localhost:3000/api/admin/doctors/${id}`);
                fetchDoctors();
            } catch (err) {
                alert('Error deleting doctor');
            }
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:3000/api/appointments/${id}/status`, { status });
            fetchAppointments();
            alert(`Appointment marked as ${status}`);
        } catch (err) {
            alert('Error updating appointment');
        }
    };

    const openEditModal = (doctor) => {
        setEditingDoctor(doctor);
        setFormData(doctor);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Navbar />
            
            <div className="pt-28 px-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-[#1FBCF9]">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-2">Manage medical staff and patient appointments</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-2 mr-4">
                            <button 
                                onClick={() => setActiveTab('doctors')}
                                className={`px-4 py-2 rounded-lg transition ${activeTab === 'doctors' ? 'bg-[#1FBCF9] text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Doctors
                            </button>
                            <button 
                                onClick={() => setActiveTab('appointments')}
                                className={`px-4 py-2 rounded-lg transition ${activeTab === 'appointments' ? 'bg-[#1FBCF9] text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Appointments
                            </button>
                        </div>
                        {activeTab === 'doctors' && (
                            <button 
                                onClick={() => {
                                    setEditingDoctor(null);
                                    setFormData({
                                        name: '', specialization: '', location: '', phone: '', address: '',
                                        rating: 4.5, email: '', image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&q=80',
                                        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
                                    });
                                    setShowModal(true);
                                }}
                                className="bg-[#1FBCF9] px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                            >
                                + Add Doctor
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#1FBCF9] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : activeTab === 'doctors' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doctor => (
                            <div key={doctor._id} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#1FBCF9]/50 transition group">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={doctor.image_url} alt={doctor.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#1FBCF9]"/>
                                    <div>
                                        <h3 className="text-xl font-bold">{doctor.name}</h3>
                                        <p className="text-[#1FBCF9]">{doctor.specialization}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-400 mb-6">
                                    <p>📍 <strong>Location:</strong> {doctor.location}</p>
                                    <p>📧 <strong>Email:</strong> {doctor.email}</p>
                                    <p>📞 <strong>Phone:</strong> {doctor.phone}</p>
                                    <p>🕒 <strong>Days:</strong> {doctor.availability.join(', ')}</p>
                                    <p>⭐ <strong>Rating:</strong> {doctor.rating}/5.0</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => openEditModal(doctor)}
                                        className="flex-1 bg-white/10 py-2 rounded-lg hover:bg-white/20 transition"
                                    >
                                        Edit Details
                                    </button>
                                    <button 
                                        onClick={() => deleteDoctor(doctor._id)}
                                        className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/10 text-gray-300 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Doctor</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {appointments.map(appt => (
                                    <tr key={appt._id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{appt.user_id?.username || 'Guest'}</p>
                                            <p className="text-xs text-gray-500">{appt.user_id?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{appt.doctor_id?.name || 'Unknown'}</p>
                                            <p className="text-xs text-[#1FBCF9]">{appt.doctor_id?.specialization}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p>{appt.date}</p>
                                            <p className="text-xs text-gray-500">{appt.time}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                appt.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 
                                                appt.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' : 
                                                'bg-[#1FBCF9]/20 text-[#1FBCF9]'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {appt.status === 'Scheduled' && (
                                                <button 
                                                    onClick={() => updateAppointmentStatus(appt._id, 'Completed')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg text-sm font-bold transition shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                                >
                                                    Mark Done
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {appointments.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                            No appointments found in the system.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                    <div className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#1FBCF9]">
                            {editingDoctor ? 'Update Doctor Details' : 'Register New Doctor'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Doctor Name</label>
                                    <input 
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Specialization</label>
                                    <input 
                                        type="text" required
                                        value={formData.specialization}
                                        onChange={e => setFormData({...formData, specialization: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email ID</label>
                                    <input 
                                        type="email" required
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                    <input 
                                        type="text" required
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Location (City)</label>
                                    <input 
                                        type="text" required
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Full Clinic Address</label>
                                    <input 
                                        type="text" required
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Rating</label>
                                    <input 
                                        type="number" step="0.1" max="5" min="1"
                                        value={formData.rating}
                                        onChange={e => setFormData({...formData, rating: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                                    <input 
                                        type="text"
                                        value={formData.image_url}
                                        onChange={e => setFormData({...formData, image_url: e.target.value})}
                                        className="w-full bg-black border border-white/20 rounded-lg p-3 focus:border-[#1FBCF9] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 text-gray-400 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-[#1FBCF9] px-8 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                                >
                                    {editingDoctor ? 'Update Doctor' : 'Save Doctor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
