import React from 'react';
import { useUser } from '../context/UserContext';
import { User, LogOut } from 'lucide-react';
import Portfolio from './Portfolio'; // Reuse the portfolio component!

const MyProfile = () => {
    const { user, logout } = useUser();

    return (
        <div>
            {/* Header Profile Card */}
            <div className="bg-terminal-card border border-terminal-border p-8 rounded-lg mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl text-gray-400">
                        <User />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">@{user?.username || "Trader"}</h1>
                        <p className="text-gray-500 text-sm">Member since 2025</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded transition-colors"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* Reuse Portfolio Logic */}
            <h3 className="text-xl font-bold text-gray-400 mb-4">Your Performance</h3>
            <Portfolio /> 
        </div>
    );
};

export default MyProfile;