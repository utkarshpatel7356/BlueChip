// src/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// Create an axios instance
const api = axios.create({
    baseURL: API_URL,
});

export const endpoints = {
    // User
    getUser: (id) => api.get(`/users/${id}`),

    // NEW: Portfolio Endpoint
    getPortfolio: (userId) => api.get(`/portfolio/${userId}`),
    
    // Posts
    getPosts: () => api.get('/posts/'),
    createPost: (content, creatorId) => api.post('/posts/', { content, creator_id: creatorId }),
    
    // Trading
    buy: (userId, postId, amount) => api.post(`/trade/buy?user_id=${userId}&post_id=${postId}&amount=${amount}`),
    sell: (userId, postId, amount) => api.post(`/trade/sell?user_id=${userId}&post_id=${postId}&amount=${amount}`),
};

export default api;