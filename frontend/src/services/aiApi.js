import { apiClient } from './api';

const generateFallbackDays = (dailyHours, mode, startDate, endDate, examDate) => {
  const days = [];
  const colors = ['#0055DA', '#00C68D', '#FF0052', '#FFD400', '#76D2DB', '#8E75B2', '#36064D'];
  const subjects = ['Database Management Systems', 'Operating Systems', 'Data Structures & Algorithms', 'Computer Networks', 'AI/ML Foundations'];

  const start = startDate ? new Date(startDate) : new Date();
  const numDays = mode === 'custom_range' && endDate
    ? Math.max(1, Math.min(14, Math.round((new Date(endDate) - start) / (24 * 3600 * 1000)) + 1))
    : 7;

  for (let i = 0; i < numDays; i++) {
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const subj = subjects[i % subjects.length];

    days.push({
      date: dayDate.toISOString().split('T')[0],
      dayName: i === 0 && !startDate ? `Today (${dayName})` : dayName,
      focusSubject: subj,
      theme: mode === 'exam_prep' ? `Exam Prep & Weak Area Drill: ${subj}` : `Active Recall & Problem Solving: ${subj}`,
      color: colors[i % colors.length],
      blocks: [
        {
          time: '6:00 PM - 7:30 PM',
          task: `Core Concept Mastery & Lab Exercises: ${subj}`,
          xp: 40,
        },
        {
          time: '8:00 PM - 9:00 PM',
          task: `Problem Solving & Flashcard Quizzes: ${subj}`,
          xp: 30,
        },
      ],
    });
  }
  return days;
};

export const aiApi = {
  /**
   * AI Tutor — POST /ai/tutor
   */
  askTutor: async ({ message, subject = 'General Computer Science', history = [] }) => {
    try {
      const response = await apiClient.post('/ai/tutor', { message, subject, history });
      return response.data;
    } catch (e) {
      const status = e.response?.status;
      if (status === 503) {
        return {
          reply: '⚠️ AI Tutor is currently in offline mode. Configure `GEMINI_API_KEY` in backend `.env` to enable live Gemini answers.',
          timestamp: new Date().toISOString(),
          suggestedFollowUps: [
            'Explain 3NF vs BCNF normalization',
            'What are the 4 Coffman conditions for deadlocks?',
            "Explain Dijkstra's algorithm time complexity",
          ],
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
   * Supports both mode="custom_range" and mode="exam_prep"
   */
  generateStudyPlan: async (preferences) => {
    const mode = preferences.mode || (preferences.examDate ? 'exam_prep' : 'custom_range');
    try {
      const response = await apiClient.post('/ai/study-planner', {
        mode,
        start_date: preferences.startDate,
        startDate: preferences.startDate,
        end_date: preferences.endDate,
        endDate: preferences.endDate,
        exam_date: preferences.examDate,
        examDate: preferences.examDate,
        preparation_level: preferences.preparationLevel,
        preparationLevel: preferences.preparationLevel,
        daily_hours: Number(preferences.dailyHours) || 3,
        dailyHours: Number(preferences.dailyHours) || 3,
        target_grade: preferences.targetGrade || 'A+',
        targetGrade: preferences.targetGrade || 'A+',
        weak_topics: preferences.weakFocus ? [preferences.weakFocus] : [],
        weakFocus: preferences.weakFocus,
        subjects: preferences.subjects,
        goals: preferences.goals,
      });

      const data = response.data;
      const rawPlan = data.plan_data || data;

      let normalizedDays = [];
      if (Array.isArray(rawPlan.days) && rawPlan.days.length > 0) {
        const colors = ['#0055DA', '#00C68D', '#FF0052', '#FFD400', '#76D2DB', '#8E75B2'];
        normalizedDays = rawPlan.days.map((d, idx) => ({
          date: d.date,
          dayName: d.dayName || d.day || `Day ${idx + 1}`,
          focusSubject: d.focusSubject || d.subject || 'Core Study',
          theme: d.theme || 'Active Problem Solving & Review',
          color: d.color || colors[idx % colors.length],
          blocks: Array.isArray(d.blocks) ? d.blocks : [],
        }));
      }

      if (normalizedDays.length === 0) {
        normalizedDays = generateFallbackDays(
          preferences.dailyHours,
          mode,
          preferences.startDate,
          preferences.endDate,
          preferences.examDate
        );
      }

      return {
        mode,
        scheduleSummary: rawPlan.scheduleSummary || rawPlan.summary || (mode === 'custom_range' ? `Custom study plan from ${preferences.startDate} to ${preferences.endDate}.` : `Exam countdown schedule targeting ${preferences.targetGrade || 'A+'}.`),
        weeklyGoalHours: rawPlan.weeklyGoalHours || (Number(preferences.dailyHours) * (mode === 'custom_range' ? normalizedDays.length : 6)) || 18,
        days: normalizedDays,
        plan_id: data.plan_id,
        generated_at: data.generated_at,
      };
    } catch (e) {
      console.warn('aiApi.generateStudyPlan fallback to offline planner:', e.message);
      const fallbackDays = generateFallbackDays(
        preferences.dailyHours,
        mode,
        preferences.startDate,
        preferences.endDate,
        preferences.examDate
      );
      return {
        mode,
        scheduleSummary: mode === 'custom_range'
          ? `Custom study plan from ${preferences.startDate || 'today'} to ${preferences.endDate || 'next week'}.`
          : `Exam countdown schedule for target date ${preferences.examDate || 'exam day'}.`,
        weeklyGoalHours: (Number(preferences.dailyHours) * fallbackDays.length) || 18,
        days: fallbackDays,
      };
    }
  },

  /**
   * AI Recommendations — GET /ai/recommendations
   */
  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/ai/recommendations');
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item, idx) => ({
          id: item.id || `rec-${idx + 1}`,
          type: item.type || item.recommendation_type || 'lesson',
          badge: item.badge || (item.type === 'revision' ? 'Spaced Revision' : item.type === 'practice' ? 'Weak Topic Practice' : 'Recommended Lesson'),
          title: item.title || 'Master Core Subject',
          subject: item.subject || 'Computer Science',
          reason: item.reason || item.ai_explanation || 'Recommended based on your active study telemetry.',
          duration: item.duration || '20 mins',
          xpPotential: item.xpPotential || item.xp_reward || 30,
          difficulty: item.difficulty || 'Medium',
          actionLabel: item.actionLabel || (item.type === 'revision' ? 'Start Revision' : item.type === 'practice' ? 'Take Practice Quiz' : 'Start Lesson'),
          actionUrl: item.actionUrl || (item.type === 'revision' ? '/revision' : item.type === 'practice' ? '/quizzes' : '/courses'),
        }));
      }
      return [];
    } catch (e) {
      console.warn('aiApi.getRecommendations fallback:', e.message);
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
        explanation: 'AI explanation unavailable. Review the lesson materials for detailed proofs.',
        correct_answer_text: correctAnswer,
        why_wrong: '',
      };
    }
  },
};
