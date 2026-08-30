import { apiClient } from './api';
import { storage } from '../utils/storage';

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    storage.set('user_profile', response.data);
    return response.data;
  },

  updateProfile: async (updates) => {
    const response = await apiClient.patch('/users/profile', updates);
    storage.set('user_profile', response.data);
    return response.data;
  },

  completeOnboarding: async (onboardingData) => {
    const response = await apiClient.post('/users/onboarding', onboardingData);
    storage.set('user_profile', response.data);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/users/me/stats');
    return response.data;
  },

  getActivity: async () => {
    const response = await apiClient.get('/users/me/activity');
    return response.data;
  },
};
