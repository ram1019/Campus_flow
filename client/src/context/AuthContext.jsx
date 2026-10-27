import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cf_token'));
  const [loading, setLoading] = useState(true);

  // Check auth on load
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth token expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('cf_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('cf_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('cf_token');
    setToken(null);
    setUser(null);
  };

  // One-click demo login helper
  const quickLogin = async (roleType) => {
    const credentials = {
      admin: { email: 'admin@campusflow.edu', password: 'password123' },
      staff: { email: 'staff.network@campusflow.edu', password: 'password123' },
      staffElec: { email: 'staff.electrical@campusflow.edu', password: 'password123' },
      student: { email: 'student.arjun@campusflow.edu', password: 'password123' },
    };

    const target = credentials[roleType] || credentials.student;
    return await login(target.email, target.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLogin,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        isStudent: user?.role === 'student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
