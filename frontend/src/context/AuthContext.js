import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Restore session on app start ──────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                if (token) {
                    const { data } = await authService.getMe();
                    setUser(data);
                }
            } catch {
                await SecureStore.deleteItemAsync('auth_token');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ── Login ─────────────────────────────────────────────────
    async function login(email, password) {
        const { data } = await authService.login({ email, password });
        // OWASP Rule 4: store token in SecureStore (encrypted on device)
        await SecureStore.setItemAsync('auth_token', data.token);
        setUser(data.user);
    }

    // ── Register ──────────────────────────────────────────────
    async function register(name, email, password) {
        const { data } = await authService.register({ name, email, password });
        await SecureStore.setItemAsync('auth_token', data.token);
        setUser(data.user);
    }

    // ── Logout ────────────────────────────────────────────────
    async function logout() {
        await SecureStore.deleteItemAsync('auth_token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
