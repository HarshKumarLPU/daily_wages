import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import i18n from '../i18n';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);

                    // Apply saved language preference
                    if (res.data.language) {
                        i18n.changeLanguage(res.data.language);
                    }
                } catch (err) {
                    console.error('Auth verification failed', err);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (phone, password, language) => {
        const res = await api.post('/auth/login', { phone, password, language });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        if (res.data.user.language) {
            i18n.changeLanguage(res.data.user.language);
        }
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        if (res.data.user.language) {
            i18n.changeLanguage(res.data.user.language);
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
