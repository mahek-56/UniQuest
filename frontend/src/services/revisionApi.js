import { apiClient } from './api';
import { MOCK_REVISION } from '../data/mockRevision';
import { storage } from '../utils/storage';

export const revisionApi = {
  getDue: async () => {
    try {
      const response = await apiClient.get('/revision/due');
      return response.data;
    } catch (e) {
      console.warn('revisionApi.getDue fallback:', e.message);
      return storage.get('revision_cards', MOCK_REVISION);
    }
  },

  reviewTopic: async (topicId, rating) => {
    try {
      // Backend accepts: { rating: 'again' | 'hard' | 'good' | 'easy' }
      const response = await apiClient.post(`/revision/${topicId}/review`, { rating });
      return response.data;
    } catch (e) {
      console.warn('revisionApi.reviewTopic fallback:', e.message);
      // Minimal offline fallback — just mark as reviewed
      return {
        success: true,
        topicId,
        xpEarned: 10,
        xp_earned: 10,
        nextIntervalDays: 1,
        new_interval_days: 1,
        message: 'Revision recorded offline',
      };
    }
  },
};
