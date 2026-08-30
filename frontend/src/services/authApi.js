import { apiClient } from './api';
import { storage } from '../utils/storage';

export const authApi = {
  login: async (credentials) => {
    // Always try real backend first
    const response = await apiClient.post('/auth/login', credentials);
    storage.set('auth_token', response.data.access_token);
    storage.set('refresh_token', response.data.refresh_token);
    storage.set('user_profile', response.data.user);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    storage.set('auth_token', response.data.access_token);
    storage.set('refresh_token', response.data.refresh_token);
    storage.set('user_profile', response.data.user);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const refreshToken = storage.get('refresh_token');
    try {
      if (refreshToken && !refreshToken.startsWith('mock_') && !refreshToken.startsWith('demo_')) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (e) {
      // Ignore logout errors — clear local state regardless
    } finally {
      storage.remove('auth_token');
      storage.remove('refresh_token');
      storage.remove('user_profile');
    }
  },

  refresh: async () => {
    const refreshToken = storage.get('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    storage.set('auth_token', response.data.access_token);
    return response.data;
  },
};
