import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
                    // Verify the token is still valid by fetching the current user
                    const { data } = await authService.getMe();
                    setUser(data);
                }
            } catch (err) {
                // Token expired or invalid – clear it and force re-login
                console.log('[AuthContext] Session restore failed, clearing token:', err?.message);
                await SecureStore.deleteItemAsync('auth_token').catch(() => { });
                setUser(null);
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
        await SecureStore.deleteItemAsync('auth_token').catch(() => { });
        setUser(null);
    }

    // ── Update user in context (after profile update) ─────────
    const updateUser = useCallback((updates) => {
        setUser((prev) => prev ? { ...prev, ...updates } : prev);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
