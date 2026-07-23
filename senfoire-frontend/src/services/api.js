import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Cet intercepteur injecte automatiquement le token stocké dans le localStorage
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('senfoire_token'); // ✅ clé corrigée (correspond à AuthContext.jsx)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;