import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  RotateCcw,
  BookOpen,
  Bot,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useGamification } from '../../context/GamificationContext';

export const QuizResultPage = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addXP, addCoins, triggerConfetti, refreshStats } = useGamification();

  const result = location.state?.result || {
    quizId: quizId || 'checkpoint-quiz',
    quizTitle: 'Mastery Checkpoint Quiz',
    totalQuestions: 5,
    correctCount: 4,
    percentage: 80,
    passed: true,
    xpEarned: 60,
    bonusXP: 20,
    coinsEarned: 20,
    questionResults: []
  };

  useEffect(() => {
    let isMounted = true;
    const syncStats = async () => {
      if (result.passed) {
        triggerConfetti();
        addXP(result.xpEarned || 30, `Passed Quiz: ${result.quizTitle || 'Quiz'}`);
        addCoins(result.coinsEarned || 15, 'Quiz Reward');
      }
      if (isMounted) {
        await refreshStats();
      }
    };
    syncStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const questionResults = Array.isArray(result.questionResults) ? result.questionResults : [];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto">
      {/* Result Hero Banner */}
      <div
        className={`border-3 border-brand-dark rounded-3xl p-6 sm:p-10 shadow-brutal-lg text-center flex flex-col items-center relative overflow-hidden ${
          result.passed ? 'bg-gradient-to-b from-amber-100 to-white' : 'bg-white'
        }`}
      >
        <div className="text-6xl mb-3 animate-bounce-slight">
          {result.passed ? '🏆' : '📚'}
        </div>

        <div className="inline-block bg-brand-dark text-white font-black text-xs uppercase px-4 py-1 rounded-full mb-3">
          {result.passed ? 'Quest Milestone Completed!' : 'Keep Practicing!'}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-brand-dark tracking-tight mb-2">
          {result.percentage}% Accuracy
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-brand-dark/70 max-w-md mb-6">
          {result.passed
            ? `Fantastic work! You correctly answered ${result.correctCount} of ${result.totalQuestions} questions.`
            : `You answered ${result.correctCount} of ${result.totalQuestions} correctly. Review the explanations below and try again!`}
        </p>

        {/* Rewards Payout Card */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white border-2 border-brand-dark rounded-2xl p-4 sm:px-8 shadow-brutal-sm mb-6">
          <div className="flex items-center gap-2 text-brand-pink font-black text-base">
            <Zap className="w-5 h-5 fill-brand-pink" />
            <span>+{result.xpEarned || 30} Total XP</span>
          </div>
          {result.bonusXP > 0 && (
            <span className="text-xs font-bold text-amber-800 bg-brand-gold px-2.5 py-0.5 rounded-full border border-brand-dark">
              ★ +{result.bonusXP} High Score Bonus!
            </span>
          )}
          <div className="flex items-center gap-1.5 text-brand-dark font-black text-base">
            <span>🪙</span>
            <span>+{result.coinsEarned || 15} Coins</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/quizzes/${quizId}`)}
            icon={RotateCcw}
          >
            Retake Quiz
          </Button>
          <Button
            variant="pink"
            size="md"
            onClick={() => navigate('/ai-tutor')}
            icon={Bot}
          >
            Ask AI Tutor About Wrong Answers
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/courses')}
            icon={ArrowRight}
          >
            Course Catalog
          </Button>
        </div>
      </div>

      {/* Question by Question Review */}
      {questionResults.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-black text-2xl text-brand-dark">Detailed Answer Review</h2>

          <div className="flex flex-col gap-4">
            {questionResults.map((q, idx) => (
              <div
                key={q.questionId || idx}
                className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-black text-sm sm:text-base text-brand-dark">
                    {idx + 1}. {q.text || `Question ${idx + 1}`}
                  </h4>
                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-brand-green bg-green-50 px-2.5 py-1 rounded-full border border-brand-green shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-brand-red bg-red-50 px-2.5 py-1 rounded-full border border-brand-red shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-2.5 rounded-xl border border-brand-dark bg-cream-50">
                    <span className="block text-[10px] uppercase text-brand-dark/60 font-bold">Your Answer</span>
                    <span className={q.isCorrect ? 'text-brand-green font-bold' : 'text-brand-red font-bold'}>
                      {q.yourAnswer || 'None selected'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-brand-dark bg-emerald-50">
                    <span className="block text-[10px] uppercase text-brand-dark/60 font-bold">Correct Answer</span>
                    <span className="text-brand-green font-bold">{q.correctAnswer || 'Correct option'}</span>
                  </div>
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 bg-cream-100/70 border border-brand-dark/30 rounded-xl text-xs font-medium text-brand-dark">
                    💡 <span className="font-bold">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
