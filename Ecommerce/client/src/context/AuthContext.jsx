/**
 * ShopEase - Auth Context
 *
 * Global state management for:
 * - Current user (if logged in)
 * - Authentication status
 * - Login/Logout methods
 * - API calls for auth actions
 */

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────────────────────────
  const register = async (name, email, password, phone) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
      });

      const { token, user: userData } = response.data;

      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed';
      const validationErrors = err.response?.data?.errors || null;
      setError(message);
      return { success: false, error: message, validationErrors };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });

      const { token, user: userData } = response.data;

      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }

    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Get Profile (refresh user data from server)
  // ─────────────────────────────────────────────────────────────────────────────
  const getProfile = async () => {
    try {
      setError(null);
      const response = await api.get('/auth/profile');
      const userData = response.data.user || response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch profile';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Update Profile
  // ─────────────────────────────────────────────────────────────────────────────
  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await api.put('/auth/profile', data);
      const userData = response.data.user || response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Change Password
  // ─────────────────────────────────────────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Password change failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete Account
  // ─────────────────────────────────────────────────────────────────────────────
  const deleteAccount = async (password) => {
    try {
      setError(null);
      await api.delete('/auth/delete-account', {
        data: { password },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete account';
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useAuth
// ─────────────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
