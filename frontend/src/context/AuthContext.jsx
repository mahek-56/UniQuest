import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { userApi } from '../services/userApi';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = storage.get('auth_token');
        const savedUser = storage.get('user_profile');

        // Skip mock/demo tokens — force real login
        if (savedToken && !savedToken.startsWith('mock_') && !savedToken.startsWith('demo_')) {
          setToken(savedToken);
          // Restore user from storage first for fast load
          if (savedUser) setUser(savedUser);
          // Then verify token is still valid by calling /auth/me
          try {
            const freshUser = await authApi.getMe();
            if (freshUser) {
              setUser(freshUser);
              storage.set('user_profile', freshUser);
            }
          } catch (e) {
            // Token is invalid/expired — clear and let user re-login
            storage.remove('auth_token');
            storage.remove('refresh_token');
            storage.remove('user_profile');
            setToken(null);
            setUser(null);
          }
        } else {
          // No valid token — clear any stale mock data
          if (savedToken && (savedToken.startsWith('mock_') || savedToken.startsWith('demo_'))) {
            storage.remove('auth_token');
            storage.remove('refresh_token');
            storage.remove('user_profile');
          }
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error('Auth init error:', e);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(userData);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = await userApi.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const completeOnboarding = async (onboardingData) => {
    const updated = await userApi.completeOnboarding(onboardingData);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        completeOnboarding,
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
