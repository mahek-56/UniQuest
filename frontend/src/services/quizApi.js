import { apiClient } from './api';
import { MOCK_QUIZZES } from '../data/mockQuizzes';
import { storage } from '../utils/storage';

/**
 * Normalize the backend quiz response to the shape the frontend expects.
 * Backend uses snake_case; some frontend components use camelCase.
 */
const normalizeQuizResult = (data) => ({
  // Backend fields (keep as-is for components that use them directly)
  attempt_id: data.attempt_id,
  quiz_id: data.quiz_id,
  score: data.score,
  correct_count: data.correct_count,
  total_questions: data.total_questions,
  passed: data.passed,
  xp_earned: data.xp_earned,
  coins_earned: data.coins_earned,
  completed_at: data.completed_at,
  question_results: data.question_results,
  // camelCase aliases for frontend components
  quizId: data.quiz_id,
  totalQuestions: data.total_questions,
  correctCount: data.correct_count,
  percentage: data.score,                    // score is already 0-100
  xpEarned: data.xp_earned,
  coinsEarned: data.coins_earned,
  submittedAt: data.completed_at,
  questionResults: (data.question_results || []).map(q => ({
    questionId: q.question_id,
    isCorrect: q.correct,
    yourAnswer: q.your_answer,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    // also keep snake_case
    question_id: q.question_id,
    correct: q.correct,
    your_answer: q.your_answer,
    correct_answer: q.correct_answer,
  })),
});

export const quizApi = {
  getQuiz: async (quizId) => {
    try {
      const response = await apiClient.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (e) {
      console.warn('getQuiz fallback to mock:', e.message);
      return MOCK_QUIZZES[quizId] || MOCK_QUIZZES['quiz-dbms-2'];
    }
  },

  submitQuiz: async (quizId, userAnswers) => {
    try {
      // Backend expects: { answers: { "<uuid>": "a" } }
      const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
        answers: userAnswers,
      });
      const result = normalizeQuizResult(response.data);
      // Cache in history
      const history = storage.get('quiz_history', []);
      storage.set('quiz_history', [result, ...history].slice(0, 50));
      return result;
    } catch (e) {
      console.warn('submitQuiz fallback to mock scoring:', e.message);
      // Offline fallback: calculate mock score locally
      const quiz = MOCK_QUIZZES[quizId] || MOCK_QUIZZES['quiz-dbms-2'];
      if (!quiz) return null;

      let correctCount = 0;
      const total = quiz.questions.length;
      const questionResults = quiz.questions.map(q => {
        const selectedOption = userAnswers[q.id];
        const isCorrect = selectedOption === q.correctIndex;
        if (isCorrect) correctCount++;
        return {
          questionId: q.id,
          isCorrect,
          yourAnswer: selectedOption,
          correctAnswer: q.correctIndex,
          explanation: q.explanation,
        };
      });

      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passed = percentage >= (quiz.passPercentage || 60);
      const xpEarned = passed ? (quiz.xpReward || 30) + (percentage >= 80 ? 20 : 0) : 10;
      const coinsEarned = passed ? (quiz.coinReward || 15) : 5;

      const result = {
        quizId, quiz_id: quizId,
        totalQuestions: total, total_questions: total,
        correctCount, correct_count: correctCount,
        percentage, score: percentage,
        passed,
        xpEarned, xp_earned: xpEarned,
        coinsEarned, coins_earned: coinsEarned,
        questionResults, question_results: questionResults,
        submittedAt: new Date().toISOString(),
      };

      const history = storage.get('quiz_history', []);
      storage.set('quiz_history', [result, ...history].slice(0, 50));
      return result;
    }
  },

  getHistory: async () => {
    try {
      const response = await apiClient.get('/quizzes/history');
      return response.data;
    } catch (e) {
      return storage.get('quiz_history', []);
    }
  },

  listQuizzes: async ({ subject, difficulty } = {}) => {
    try {
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (difficulty) params.set('difficulty', difficulty);
      const response = await apiClient.get(`/quizzes/?${params.toString()}`);
      return response.data;
    } catch (e) {
      return [];
    }
  },
};
