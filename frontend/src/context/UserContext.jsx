// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { endpoints } from '../api';
import api from '../api'; // We import the raw axios instance to set headers

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // 1. Helper to fetch user details
    const refreshUser = async () => {
        if (!token) return;
        try {
            // Set the token in the header manually for this request to be safe
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Call the new /users/me endpoint
            const res = await endpoints.getMe();
            setUser(res.data);
            setBalance(res.data.balance);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // If token is invalid (401), log them out
            if (error.response && error.response.status === 401) {
                logout();
            }
        }
    };

    // 2. Run on mount or when token changes
    useEffect(() => {
        refreshUser();
    }, [token]);

    // 3. Login Action
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        // refreshUser will trigger automatically due to useEffect
    };

    // 4. Logout Action
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setBalance(0);
        window.location.href = '/login'; // Force redirect
    };

    return (
        <UserContext.Provider value={{ user, balance, token, login, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);