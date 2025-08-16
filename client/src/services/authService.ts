import axios from 'axios';
import { RegisterData } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
    guestCartItems?: any[];
  }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (emailData: { email: string }) => {
    const response = await api.post('/auth/forgot-password', emailData);
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, passwordData: { password: string }) => {
    const response = await api.put(`/auth/reset-password/${token}`, passwordData);
    return response.data;
  },
};

export default api;