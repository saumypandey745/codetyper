import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('codetyper_token');
      if (storedToken) {
        api.setToken(storedToken);
        try {
          const res = await api.auth.me();
          setUser(res.user);
          setUserStats(res.statistics);
        } catch (err) {
          console.warn('Session expired or invalid', err.message);
          api.setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await api.auth.login(credentials);
    api.setToken(res.token);
    setUser(res.user);
    // Fetch refreshed stats
    try {
      const me = await api.auth.me();
      setUserStats(me.statistics);
    } catch (e) {}
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    api.setToken(res.token);
    setUser(res.user);
    try {
      const me = await api.auth.me();
      setUserStats(me.statistics);
    } catch (e) {}
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {}
    api.setToken(null);
    setUser(null);
    setUserStats(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
      setUserStats(res.statistics);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userStats,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
