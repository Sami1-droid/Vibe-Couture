import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  phone?: string;
  addresses?: Address[];
  wishlist?: string[];
}

interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, guestCartItems?: any[]) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Update localStorage when token changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.getMe();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token },
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string, guestCartItems?: any[]) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login({ email, password, guestCartItems });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Registration failed',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.updateProfile(userData);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Profile update failed',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.changePassword({ currentPassword, newPassword });
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Password change failed',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.forgotPassword({ email });
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Password reset request failed',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.resetPassword(token, { password });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user || state.user!, token: response.token },
      });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Password reset failed',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.verifyEmail(token);
      if (state.user) {
        dispatch({
          type: 'SET_USER',
          payload: { ...state.user, isEmailVerified: true },
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Email verification failed',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resendVerification = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authService.resendVerification();
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Failed to resend verification email',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    clearError,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User, AuthState, RegisterData, Address };