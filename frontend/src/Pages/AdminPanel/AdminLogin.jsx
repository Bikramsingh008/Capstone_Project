import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../LandingPage/Navbar';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/admin/login', { username, password });
            sessionStorage.setItem('adminUser', JSON.stringify(res.data.admin));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white/5 p-10 rounded-2xl border border-white/10 w-full max-w-md shadow-[0_0_50px_rgba(31,188,249,0.1)]">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#1FBCF9]">Admin Access</h1>
                        <p className="text-gray-400 mt-2">Enter credentials to manage healthcare system</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-center text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1FBCF9] transition"
                                placeholder="vicky"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1FBCF9] transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-[#1FBCF9] hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition shadow-[0_0_20px_rgba(31,188,249,0.3)]"
                        >
                            Log In as Admin
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
