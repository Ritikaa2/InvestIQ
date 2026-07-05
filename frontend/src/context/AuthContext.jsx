import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Create default Axios instance pointing to backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000 // 60s timeout for agent workflows
});

// Interceptor to inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/profile');
        if (response.data.success) {
          setUser(response.data.profile);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success(response.data.message || 'Log in successful!');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please verify credentials.';
      toast.error(msg);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful!');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const updateProfile = async (formData) => {
    try {
      const response = await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully.');
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Profile update failed.';
      toast.error(msg);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};




