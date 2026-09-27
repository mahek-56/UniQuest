import { apiClient } from './api';
import { MOCK_REVISION } from '../data/mockRevision';
import { storage } from '../utils/storage';

const normalizeRevisionCard = (item, idx) => {
  return {
    id: item.id || `rev-${idx + 1}`,
    topic: item.topic || 'Concept Recall',
    subject: item.subject || 'Computer Science',
    dueToday: item.dueToday !== undefined ? item.dueToday : true,
    dueInDays: item.dueInDays || 0,
    intervalDays: item.interval_days || item.intervalDays || 1,
    difficulty: item.difficulty || 'Medium',
    question: item.question || `Explain the key concepts, invariants, and rules of: ${item.topic}`,
    answer: item.answer || `Key principles of ${item.topic} in ${item.subject}:\n\n- Understand core definitions and properties.\n- Apply appropriate design or algorithmic paradigms.\n- Check boundary cases and performance complexities.`,
  };
};

export const revisionApi = {
  getDue: async () => {
    try {
      const response = await apiClient.get('/revision/due');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(normalizeRevisionCard);
      }
      return (storage.get('revision_cards', MOCK_REVISION) || []).map(normalizeRevisionCard);
    } catch (e) {
      console.warn('revisionApi.getDue fallback:', e.message);
      return (storage.get('revision_cards', MOCK_REVISION) || []).map(normalizeRevisionCard);
    }
  },

  reviewTopic: async (topicId, rating) => {
    try {
      const response = await apiClient.post(`/revision/${topicId}/review`, { rating });
      return response.data;
    } catch (e) {
      console.warn('revisionApi.reviewTopic fallback:', e.message);
      return {
        success: true,
        topicId,
        xpEarned: 15,
        xp_earned: 15,
        nextIntervalDays: 1,
        new_interval_days: 1,
        message: 'Revision recorded',
      };
    }
  },
};
