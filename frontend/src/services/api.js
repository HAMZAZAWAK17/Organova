import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── OWASP Rule 4: API URL from EXPO_PUBLIC_ env variable ──
// Expo only exposes variables prefixed with EXPO_PUBLIC_ at runtime.
const BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.3:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ───────────────────────
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor: handle 401 globally ─────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('auth_token');
            // Navigation to login is handled by AuthContext
        }
        return Promise.reject(error);
    }
);

export default api;
