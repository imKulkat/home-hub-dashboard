import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/config/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    setState({
      isAuthenticated: !!token,
      isLoading: false,
      error: null,
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(API_CONFIG.endpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      sessionStorage.setItem('auth_token', data.token);
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (err) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    login,
    logout,
  };
};
