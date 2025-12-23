import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Register new user
 */
export const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    const token = response.data.access_token || response.data.token;
    if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    return { ...response.data, token };
};

/**
 * Login user
 */
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.access_token || response.data.token;
    if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    return { ...response.data, token };
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_DOCS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
};
