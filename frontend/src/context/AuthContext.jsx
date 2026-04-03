import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage first (remember me), then sessionStorage (session only)
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && userData) {
            setToken(storedToken);
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // rememberMe=true → localStorage (persists across sessions)
    // rememberMe=false → sessionStorage (clears on tab/browser close)
    const login = (userData, userToken, rememberMe = false) => {
        const storage = rememberMe ? localStorage : sessionStorage;

        // Clear both to avoid stale data from a previous preference
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        storage.setItem('token', userToken);
        storage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
