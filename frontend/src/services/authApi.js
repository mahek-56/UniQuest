import { apiClient } from './api';
import { storage } from '../utils/storage';

export const normalizeUser = (user) => {
  if (!user) return null;
  const name = user.full_name || user.name || 'Scholar';
  const avatar = user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=FFD400`;

  return {
    ...user,
    name,
    full_name: name,
    avatar,
    avatar_url: avatar,
    department: user.department || 'Computer Engineering',
    university: user.university || 'National Tech University',
    dailyStudyTargetMinutes: user.daily_study_target_minutes || user.dailyStudyTargetMinutes || 45,
    daily_study_target_minutes: user.daily_study_target_minutes || user.dailyStudyTargetMinutes || 45,
    preferredStudyTime: user.preferred_study_time || user.preferredStudyTime || 'Evening (6 PM - 9 PM)',
    preferred_study_time: user.preferred_study_time || user.preferredStudyTime || 'Evening (6 PM - 9 PM)',
  };
};

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const normalized = normalizeUser(response.data.user);
    storage.set('auth_token', response.data.access_token);
    storage.set('refresh_token', response.data.refresh_token);
    storage.set('user_profile', normalized);
    return { ...response.data, user: normalized };
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    const normalized = normalizeUser(response.data.user);
    storage.set('auth_token', response.data.access_token);
    storage.set('refresh_token', response.data.refresh_token);
    storage.set('user_profile', normalized);
    return { ...response.data, user: normalized };
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return normalizeUser(response.data);
  },

  logout: async () => {
    const refreshToken = storage.get('refresh_token');
    try {
      if (refreshToken && !refreshToken.startsWith('mock_') && !refreshToken.startsWith('demo_')) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (e) {
      // Ignore logout errors
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
