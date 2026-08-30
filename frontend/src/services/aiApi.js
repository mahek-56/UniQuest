import { apiClient } from './api';

export const aiApi = {
  /**
   * AI Tutor — POST /ai/tutor
   * Request: { message, subject, history }
   * Response: { reply, timestamp, suggestedFollowUps }
   */
  askTutor: async ({ message, subject = 'General Computer Science', history = [] }) => {
    try {
      const response = await apiClient.post('/ai/tutor', { message, subject, history });
      return response.data;
    } catch (e) {
      const status = e.response?.status;
      if (status === 503) {
        return {
          reply: '⚠️ AI Tutor is currently unavailable. The Gemini API key may not be configured on the server. Please check the backend `.env` file.',
          timestamp: new Date().toISOString(),
          suggestedFollowUps: [],
        };
      }
      return {
        reply: '⚠️ Could not connect to the AI Tutor. Please ensure the backend server is running at `http://localhost:8000`.',
        timestamp: new Date().toISOString(),
        suggestedFollowUps: [],
      };
    }
  },

  /**
   * AI Study Planner — POST /ai/study-planner
   * Request: { dailyHours, targetGrade, subjects, weakTopics, goals }
   * Response: { plan_id, plan_data: { days, scheduleSummary, ... }, generated_at }
   */
  generateStudyPlan: async (preferences) => {
    try {
      const response = await apiClient.post('/ai/study-planner', preferences);
      const data = response.data;
      const rawPlan = data.plan_data || data;

      // Normalize if backend returned daily_sessions format
      let normalizedDays = [];
      if (Array.isArray(rawPlan.days)) {
        normalizedDays = rawPlan.days;
      } else if (Array.isArray(rawPlan.daily_sessions)) {
        const colors = ['#0055DA', '#00C68D', '#FF0052', '#FFD400', '#76D2DB', '#8E75B2'];
        normalizedDays = rawPlan.daily_sessions.map((ds, idx) => {
          const sessions = ds.sessions || [];
          const primarySubject = sessions[0]?.subject || 'Study Focus';
          return {
            dayName: `Day ${ds.day || idx + 1}`,
            focusSubject: primarySubject,
            theme: sessions.map(s => s.topic).filter(Boolean).join(', ') || 'Active Study & Review',
            color: colors[idx % colors.length],
            blocks: sessions.map(s => ({
              time: `${s.duration_minutes || 45} mins`,
              task: `${s.activity_type ? s.activity_type.toUpperCase() + ': ' : ''}${s.topic || s.subject || 'Core Study'}`,
              xp: Math.round((s.duration_minutes || 45) * 0.75),
            })),
          };
        });
      }

      return {
        scheduleSummary: rawPlan.scheduleSummary || rawPlan.summary || 'Custom study plan crafted for your goals.',
        weeklyGoalHours: rawPlan.weeklyGoalHours || (Number(preferences.dailyHours) * 6) || 18,
        days: normalizedDays,
        plan_id: data.plan_id,
        generated_at: data.generated_at,
      };
    } catch (e) {
      const status = e.response?.status;
      if (status === 503) {
        return {
          error: true,
          message: '⚠️ Study Planner requires a Gemini API key. Add GEMINI_API_KEY to backend/.env',
        };
      }
      return {
        error: true,
        message: '⚠️ Could not generate study plan. Please ensure the backend is running.',
      };
    }
  },

  /**
   * AI Recommendations — GET /ai/recommendations
   * Response: [{ id, type, subject, title, reason, duration, xpPotential, ... }]
   */
  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/ai/recommendations');
      return Array.isArray(response.data) ? response.data : [];
    } catch (e) {
      console.warn('aiApi.getRecommendations failed:', e.message);
      return [];
    }
  },

  /**
   * AI Wrong-Answer Explanation — POST /ai/explain-answer
   */
  explainAnswer: async ({ questionText, options, correctAnswer, userAnswer, subject }) => {
    try {
      const response = await apiClient.post('/ai/explain-answer', {
        question_text: questionText,
        options,
        correct_answer: correctAnswer,
        user_answer: userAnswer,
        subject,
      });
      return response.data;
    } catch (e) {
      return {
        explanation: 'AI explanation unavailable. Check if Gemini API key is configured.',
        correct_answer_text: correctAnswer,
        why_wrong: '',
      };
    }
  },
};
