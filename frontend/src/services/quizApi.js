import { apiClient } from './api';
import { MOCK_QUIZZES } from '../data/mockQuizzes';
import { storage } from '../utils/storage';

const normalizeQuestion = (q, idx) => {
  const optionsRaw = q.options || [];
  // Normalize options into a standard array of { key, text }
  const options = optionsRaw.map((opt, oIdx) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        key: opt.key || String.fromCharCode(97 + oIdx), // 'a', 'b', ...
        text: opt.text || String(opt),
      };
    }
    return {
      key: String.fromCharCode(97 + oIdx), // 'a', 'b', ...
      text: String(opt),
    };
  });

  return {
    id: q.id || `q-${idx + 1}`,
    text: q.text || 'Question',
    options,
    explanation: q.explanation || '',
    correctAnswer: q.correct_answer || q.correctAnswer || (q.correctIndex !== undefined ? String.fromCharCode(97 + q.correctIndex) : 'a'),
  };
};

const normalizeQuiz = (raw) => {
  if (!raw) return null;
  const questions = (raw.questions || []).map((q, idx) => normalizeQuestion(q, idx));

  return {
    id: raw.id,
    title: raw.title || 'Checkpoint Quiz',
    subject: raw.subject || 'Computer Science',
    courseTitle: raw.course_title || raw.subject || 'Module Quiz',
    difficulty: raw.difficulty || 'medium',
    passScore: raw.pass_score !== undefined ? raw.pass_score : (raw.passPercentage || 60),
    passPercentage: raw.pass_score !== undefined ? raw.pass_score : (raw.passPercentage || 60),
    xpReward: raw.xp_reward || (questions.length * 10) || 30,
    questions,
    durationMinutes: raw.duration_minutes || raw.durationMinutes || Math.max(5, questions.length * 2),
  };
};

const normalizeQuizResult = (data, quiz = null) => {
  const questionsMap = {};
  if (quiz && Array.isArray(quiz.questions)) {
    quiz.questions.forEach(q => {
      questionsMap[q.id] = q;
    });
  }

  const rawQuestionResults = data.question_results || data.questionResults || [];
  const normalizedQuestionResults = rawQuestionResults.map((q, idx) => {
    const qId = q.question_id || q.questionId || `q-${idx + 1}`;
    const originalQ = questionsMap[qId];

    let yourAnswerText = q.your_answer || q.yourAnswer || 'Not answered';
    let correctAnswerText = q.correct_answer || q.correctAnswer || '';

    // If options map exists, resolve letters ('a', 'b') to readable text
    if (originalQ && Array.isArray(originalQ.options)) {
      const userOpt = originalQ.options.find(o => o.key === q.your_answer || o.key === q.yourAnswer);
      if (userOpt) yourAnswerText = `${userOpt.key.toUpperCase()}) ${userOpt.text}`;

      const correctOpt = originalQ.options.find(o => o.key === q.correct_answer || o.key === q.correctAnswer);
      if (correctOpt) correctAnswerText = `${correctOpt.key.toUpperCase()}) ${correctOpt.text}`;
    }

    return {
      questionId: qId,
      question_id: qId,
      text: q.text || originalQ?.text || `Question ${idx + 1}`,
      isCorrect: q.correct !== undefined ? q.correct : (q.isCorrect || false),
      correct: q.correct !== undefined ? q.correct : (q.isCorrect || false),
      yourAnswer: yourAnswerText,
      correctAnswer: correctAnswerText,
      explanation: q.explanation || originalQ?.explanation || 'Review the lesson concepts for more details.',
    };
  });

  const totalQuestions = data.total_questions || data.totalQuestions || normalizedQuestionResults.length || 5;
  const correctCount = data.correct_count !== undefined ? data.correct_count : (data.correctCount || 0);
  const score = data.score !== undefined ? data.score : (data.percentage || Math.round((correctCount / totalQuestions) * 100));

  return {
    attemptId: data.attempt_id || data.attemptId,
    quizId: data.quiz_id || data.quizId,
    quizTitle: quiz?.title || data.quiz_title || 'Checkpoint Quiz',
    score,
    percentage: score,
    correctCount,
    totalQuestions,
    passed: data.passed !== undefined ? data.passed : (score >= 60),
    xpEarned: data.xp_earned !== undefined ? data.xp_earned : (data.xpEarned || 30),
    bonusXP: score >= 80 ? 20 : 0,
    coinsEarned: data.coins_earned !== undefined ? data.coins_earned : (data.coinsEarned || 15),
    submittedAt: data.completed_at || data.submittedAt || new Date().toISOString(),
    questionResults: normalizedQuestionResults,
  };
};

export const quizApi = {
  getQuiz: async (quizId) => {
    try {
      const response = await apiClient.get(`/quizzes/${quizId}`);
      return normalizeQuiz(response.data);
    } catch (e) {
      console.warn('getQuiz fallback to mock:', e.message);
      const fallback = MOCK_QUIZZES[quizId] || MOCK_QUIZZES['quiz-dbms-2'];
      return normalizeQuiz(fallback);
    }
  },

  submitQuiz: async (quizId, userAnswers) => {
    // Format answers for backend: { "<question_id>": "a" }
    let quizObj = null;
    try {
      quizObj = await quizApi.getQuiz(quizId);
    } catch (_) {}

    try {
      const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
        answers: userAnswers,
      });
      const result = normalizeQuizResult(response.data, quizObj);
      const history = storage.get('quiz_history', []);
      storage.set('quiz_history', [result, ...history].slice(0, 50));
      return result;
    } catch (e) {
      console.warn('submitQuiz fallback to offline scoring:', e.message);
      const quiz = quizObj || MOCK_QUIZZES[quizId] || MOCK_QUIZZES['quiz-dbms-2'];
      if (!quiz) return null;

      let correctCount = 0;
      const questions = quiz.questions || [];
      const total = questions.length;
      const questionResults = questions.map((q, idx) => {
        const selected = userAnswers[q.id];
        const isCorrect = selected === q.correctAnswer;
        if (isCorrect) correctCount++;
        return {
          question_id: q.id,
          text: q.text,
          correct: isCorrect,
          your_answer: selected || 'None',
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        };
      });

      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passed = percentage >= (quiz.passScore || 60);

      const localResult = normalizeQuizResult({
        quiz_id: quizId,
        total_questions: total,
        correct_count: correctCount,
        score: percentage,
        passed,
        xp_earned: passed ? (quiz.xpReward || 30) + (percentage >= 80 ? 20 : 0) : 10,
        coins_earned: passed ? 15 : 5,
        question_results: questionResults,
        completed_at: new Date().toISOString(),
      }, quiz);

      const history = storage.get('quiz_history', []);
      storage.set('quiz_history', [localResult, ...history].slice(0, 50));
      return localResult;
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
