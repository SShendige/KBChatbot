import React, { createContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getCurrentUser, isAuthenticated, getStoredUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is already authenticated
        const initAuth = async () => {
            if (isAuthenticated()) {
                try {
                    const storedUser = getStoredUser();
                    setUser(storedUser);

                    // Verify token is still valid
                    const currentUser = await getCurrentUser();
                    setUser(currentUser);
                } catch (err) {
                    console.error('Auth initialization error:', err);
                    logoutService();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const data = await loginService(email, password);
            setUser(data.user);
            return data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const register = async (email, password) => {
        try {
            setError(null);
            const data = await registerService(email, password);
            setUser(data.user);
            return data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
