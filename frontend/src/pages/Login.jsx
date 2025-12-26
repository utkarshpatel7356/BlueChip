import React, { useState } from 'react';
import { endpoints } from '../api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useUser();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await endpoints.register(username, password);
                alert("Account created! Now login.");
                setIsRegister(false);
            } else {
                const res = await endpoints.login(username, password);
                login(res.data.access_token, username);
                navigate('/');
            }
        } catch (err) {
            alert("Error: " + (err.response?.data?.detail || "Failed"));
        }
    };

    return (
        <div className="min-h-screen bg-terminal-main flex items-center justify-center p-4">
            <div className="bg-terminal-card border border-terminal-border p-8 rounded-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-trade-up mb-6 text-center">BLUECHIP</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        className="w-full bg-black border border-terminal-border p-3 text-white rounded"
                        placeholder="Username" 
                        value={username} onChange={e => setUsername(e.target.value)}
                    />
                    <input 
                        className="w-full bg-black border border-terminal-border p-3 text-white rounded"
                        type="password" placeholder="Password"
                        value={password} onChange={e => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-trade-up text-black font-bold p-3 rounded hover:opacity-90">
                        {isRegister ? "REGISTER" : "LOGIN"}
                    </button>
                </form>
                <button 
                    onClick={() => setIsRegister(!isRegister)}
                    className="w-full text-center text-gray-500 mt-4 text-sm hover:text-white"
                >
                    {isRegister ? "Already have an account? Login" : "Need an account? Register"}
                </button>
            </div>
        </div>
    );
};

export default Login;