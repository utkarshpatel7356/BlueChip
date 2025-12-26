// src/context/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { endpoints } from '../api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const USER_ID = 1; // Hardcoded for MVP

    const refreshUser = async () => {
        try {
            const res = await endpoints.getUser(USER_ID);
            setUser(res.data);
            setBalance(res.data.balance);
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, balance, refreshUser, USER_ID }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);