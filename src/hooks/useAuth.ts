import { useState, useEffect } from 'react';
import { supabaseAuthService, LoginCredentials, RegisterData, User } from '../services/supabaseAuth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await supabaseAuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      if (__DEV__) console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await supabaseAuthService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await supabaseAuthService.register(data);
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      } else {
        setError(response.error || 'Registration failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const response = await supabaseAuthService.logout();
      
      if (response.success) {
        setUser(null);
      } else {
        setError(response.error || 'Logout failed');
      }
    } catch (err) {
      if (__DEV__) console.error('Logout error:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await supabaseAuthService.getCurrentUser();
      setUser(currentUser);
      return { success: true };
    } catch (err) {
      if (__DEV__) console.error('Refresh user failed:', err);
      return { success: false, error: 'Failed to refresh user data' };
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };
};