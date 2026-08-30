import { apiClient } from './api';
import { MOCK_ANALYTICS } from '../data/mockAnalytics';

export const analyticsApi = {
  getOverview: async () => {
    try {
      const response = await apiClient.get('/analytics/overview');
      return response.data;
    } catch (e) {
      console.warn('analyticsApi.getOverview fallback:', e.message);
      return MOCK_ANALYTICS;
    }
  },

  getProgress: async () => {
    try {
      const response = await apiClient.get('/analytics/progress');
      return response.data;
    } catch (e) {
      return MOCK_ANALYTICS.progressTimeline || [];
    }
  },

  getSubjects: async () => {
    try {
      const response = await apiClient.get('/analytics/subjects');
      return response.data;
    } catch (e) {
      return MOCK_ANALYTICS.subjectPerformance || [];
    }
  },

  getWeakTopics: async () => {
    try {
      const response = await apiClient.get('/analytics/weak-topics');
      return response.data;
    } catch (e) {
      return MOCK_ANALYTICS.weakTopics || [];
    }
  },

  getStudyTime: async () => {
    try {
      const response = await apiClient.get('/analytics/study-time');
      return response.data;
    } catch (e) {
      return MOCK_ANALYTICS.studyTime || [];
    }
  },

  getMLPrediction: async () => {
    try {
      const response = await apiClient.get('/analytics/ml-prediction');
      return response.data;
    } catch (e) {
      console.warn('ML prediction fallback:', e.message);
      // Return a safe "no data" state rather than fake prediction
      return {
        prediction: 'insufficient_data',
        confidence: null,
        key_factors: [],
        timestamp: new Date().toISOString(),
        message: 'Complete more quizzes to unlock performance prediction.',
      };
    }
  },
};
