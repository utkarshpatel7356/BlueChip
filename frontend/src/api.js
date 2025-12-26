// src/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// Create an axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Automatic Token Insertion
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const endpoints = {
    // Auth
    login: (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        return api.post('/token', formData);
    },
    register: (username, password) => api.post('/register', { 
        username, 
        password_hash: password, 
        balance: 1000 
    }),
    getMe: () => api.get('/users/me'),

    // Portfolio
    getPortfolio: (userId) => api.get(`/portfolio/${userId}`),
    
    // Posts
    getPosts: () => api.get('/posts/'),
    
    // CORRECTION HERE: Removed 'creatorId'. The backend gets it from the token now.
    createPost: (content) => api.post('/posts/', { content }), 
    
    getLeaderboard: () => api.get('/leaderboard'),

    // Trading
    buy: (postId, amount) => api.post(`/trade/buy?post_id=${postId}&amount=${amount}`),
    sell: (postId, amount) => api.post(`/trade/sell?post_id=${postId}&amount=${amount}`),
};

export default api;