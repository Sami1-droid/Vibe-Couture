import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Types
interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt: string; isPrimary: boolean }>;
    brand: string;
  };
  variant: {
    size: string;
    sku: string;
    price: number;
  };
  quantity: number;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

interface CartContextType extends CartState {
  addToCart: (productId: string, variant: any, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, sku: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, sku: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCart: () => Promise<void>;
  clearError: () => void;
}

// Action types
type CartAction =
  | { type: 'CART_LOADING' }
  | { type: 'CART_SUCCESS'; payload: CartState }
  | { type: 'CART_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_CART'; payload: Partial<CartState> };

// Initial state
const initialState: CartState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  isLoading: false,
  error: null,
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CART_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'CART_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };
    case 'CART_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_CART':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      getCart();
    }
  }, [isAuthenticated, user]);

  const getCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' });
      // TODO: Implement API call
      // const response = await cartService.getCart();
      // dispatch({ type: 'CART_SUCCESS', payload: response });
      
      // For now, use mock data
      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: [],
          subtotal: 0,
          totalItems: 0,
          isLoading: false,
          error: null,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.message || 'Failed to load cart',
      });
    }
  };

  const addToCart = async (productId: string, variant: any, quantity = 1) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      // TODO: Implement API call
      // const response = await cartService.addToCart(productId, variant, quantity);
      // dispatch({ type: 'CART_SUCCESS', payload: response });
      
      // For now, simulate success
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.message || 'Failed to add item to cart',
      });
      throw error;
    }
  };

  const updateQuantity = async (productId: string, sku: string, quantity: number) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      // TODO: Implement API call
      // const response = await cartService.updateQuantity(productId, sku, quantity);
      // dispatch({ type: 'CART_SUCCESS', payload: response });
      
      // For now, simulate success
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.message || 'Failed to update quantity',
      });
      throw error;
    }
  };

  const removeFromCart = async (productId: string, sku: string) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      // TODO: Implement API call
      // const response = await cartService.removeFromCart(productId, sku);
      // dispatch({ type: 'CART_SUCCESS', payload: response });
      
      // For now, simulate success
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.message || 'Failed to remove item from cart',
      });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' });
      // TODO: Implement API call
      // await cartService.clearCart();
      
      dispatch({
        type: 'CART_SUCCESS',
        payload: {
          items: [],
          subtotal: 0,
          totalItems: 0,
          isLoading: false,
          error: null,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.message || 'Failed to clear cart',
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCart,
    clearError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export type { CartItem, CartState };