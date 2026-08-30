import { apiClient } from './api';
import { storage } from '../utils/storage';

// Minimal offline fallback — only used when backend is unreachable
const OFFLINE_NOTIFICATIONS = [
  {
    id: 'offline-1',
    title: '📡 Backend Offline',
    message: 'Could not connect to UniQuest server. Start the backend and refresh.',
    type: 'system',
    read: false,
    timestamp: 'Just now',
  },
];

export const notificationApi = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      // Backend returns array directly
      const notifications = Array.isArray(response.data) ? response.data : [];
      storage.set('notifications_cache', notifications);
      return notifications;
    } catch (e) {
      console.warn('notificationApi.getNotifications fallback:', e.message);
      return storage.get('notifications_cache', OFFLINE_NOTIFICATIONS);
    }
  },

  markAsRead: async (notifId) => {
    try {
      await apiClient.post(`/notifications/${notifId}/read`);
      // Update local cache
      const cached = storage.get('notifications_cache', []);
      const updated = cached.map(n => n.id === notifId ? { ...n, read: true } : n);
      storage.set('notifications_cache', updated);
      return updated;
    } catch (e) {
      // Update cache even if request fails
      const cached = storage.get('notifications_cache', []);
      const updated = cached.map(n =>
        (n.id === notifId || n.id === String(notifId)) ? { ...n, read: true } : n
      );
      storage.set('notifications_cache', updated);
      return updated;
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post('/notifications/read-all');
      const cached = storage.get('notifications_cache', []);
      const updated = cached.map(n => ({ ...n, read: true }));
      storage.set('notifications_cache', updated);
      return updated;
    } catch (e) {
      const cached = storage.get('notifications_cache', []);
      const updated = cached.map(n => ({ ...n, read: true }));
      storage.set('notifications_cache', updated);
      return updated;
    }
  },
};
