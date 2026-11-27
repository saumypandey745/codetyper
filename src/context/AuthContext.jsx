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
    if (typeof window !== 'undefined' && res.user) {
      try {
        localStorage.setItem('codetyper_last_user', JSON.stringify({
          email: res.user.email,
          name: res.user.full_name || res.user.username,
          avatar: res.user.avatar_url
        }));
      } catch (e) {}
    }
    // Fetch full profile including statistics in one call
    try {
      const me = await api.auth.me();
      setUser(me.user);
      setUserStats(me.statistics);
    } catch (e) {
      // Non-fatal: user is logged in, stats will load on next /me call
    }
    return res;
  };

  const loginWithGoogleCredential = async (credential) => {
    const res = await api.auth.googleOneTap(credential);
    api.setToken(res.token);
    setUser(res.user);
    if (typeof window !== 'undefined' && res.user) {
      try {
        localStorage.setItem('codetyper_last_user', JSON.stringify({
          email: res.user.email,
          name: res.user.full_name || res.user.username,
          avatar: res.user.avatar_url
        }));
      } catch (e) {}
    }
    try {
      const me = await api.auth.me();
      setUser(me.user);
      setUserStats(me.statistics);
    } catch (e) {}
    return res;
  };

  const continueAsUser = async (email) => {
    const res = await api.auth.continueAs(email);
    api.setToken(res.token);
    setUser(res.user);
    if (typeof window !== 'undefined' && res.user) {
      try {
        localStorage.setItem('codetyper_last_user', JSON.stringify({
          email: res.user.email,
          name: res.user.full_name || res.user.username,
          avatar: res.user.avatar_url
        }));
      } catch (e) {}
    }
    try {
      const me = await api.auth.me();
      setUser(me.user);
      setUserStats(me.statistics);
    } catch (e) {}
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    api.setToken(res.token);
    setUser(res.user);
    if (typeof window !== 'undefined' && res.user) {
      try {
        localStorage.setItem('codetyper_last_user', JSON.stringify({
          email: res.user.email,
          name: res.user.full_name || res.user.username,
          avatar: res.user.avatar_url
        }));
      } catch (e) {}
    }
    // Fetch full profile including statistics
    try {
      const me = await api.auth.me();
      setUser(me.user);
      setUserStats(me.statistics);
    } catch (e) {
      // Non-fatal
    }
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

  const updateUserProfile = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userStats,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithGoogleCredential,
        continueAsUser,
        register,
        logout,
        refreshUser,
        updateUserProfile,
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
