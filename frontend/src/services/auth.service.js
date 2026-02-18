import api from './api';

/**
 * Auth Service
 * OWASP Rule 1 & 2: validation done on both frontend (screens) and backend.
 * OWASP Rule 4: token stored in SecureStore (encrypted), not plain AsyncStorage.
 */

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};
