import { apiClient } from './api';
import { storage } from '../utils/storage';
import { normalizeUser } from './authApi';

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    const normalized = normalizeUser(response.data);
    storage.set('user_profile', normalized);
    return normalized;
  },

  updateProfile: async (updates) => {
    const response = await apiClient.patch('/users/profile', updates);
    const normalized = normalizeUser(response.data);
    storage.set('user_profile', normalized);
    return normalized;
  },

  completeOnboarding: async (onboardingData) => {
    const response = await apiClient.post('/users/onboarding', onboardingData);
    const normalized = normalizeUser(response.data);
    storage.set('user_profile', normalized);
    return normalized;
  },

  getStats: async () => {
    const response = await apiClient.get('/users/me/stats');
    return response.data;
  },

  getActivity: async () => {
    const response = await apiClient.get('/users/me/activity');
    return response.data;
  },

  searchStudents: async (query = '') => {
    try {
      const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (e) {
      console.warn('searchStudents fallback:', e.message);
      return [];
    }
  },

  compareStudent: async (targetUserId) => {
    const response = await apiClient.get(`/users/compare/${targetUserId}`);
    return response.data;
  },
};
