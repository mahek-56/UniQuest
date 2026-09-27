import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Send,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { quizApi } from '../../services/quizApi';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';

export const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 mins
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await quizApi.getQuiz(quizId);
        if (!isMounted) return;
        if (data && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuiz(data);
          if (data.durationMinutes) {
            setTimeLeftSeconds(data.durationMinutes * 60);
          }
        } else {
          setError('Quiz could not be loaded or has no questions.');
        }
      } catch (e) {
        if (!isMounted) return;
        console.error('Failed to load quiz:', e);
        setError('Failed to load checkpoint quiz.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadQuiz();
    return () => {
      isMounted = false;
    };
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeftSeconds]);

  if (loading) {
    return (
      <div className="text-center py-20 bg-white border-2 border-brand-dark rounded-3xl shadow-brutal max-w-xl mx-auto my-10 p-8">
        <div className="animate-spin text-4xl mb-3">🎯</div>
        <p className="font-bold text-brand-dark text-base">Preparing Checkpoint Quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-16 bg-white border-3 border-brand-dark rounded-3xl shadow-brutal max-w-xl mx-auto my-10 p-6">
        <div className="text-5xl mb-3">⚠️</div>
        <h3 className="font-black text-brand-dark text-xl">Quiz Unavailable</h3>
        <p className="text-xs font-semibold text-brand-dark/70 mt-1 mb-6">
          {error || 'Unable to retrieve questions for this quiz.'}
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/courses')} icon={ArrowLeft}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await quizApi.submitQuiz(quiz.id, answers);
      navigate(`/quizzes/${quiz.id}/result`, { state: { result } });
    } catch (e) {
      console.error('Quiz submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = quiz.questions[currentIdx] || quiz.questions[0];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Quiz Header Bar */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-5 sm:p-6 shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase bg-brand-gold px-2.5 py-0.5 rounded-full border border-brand-dark">
              {quiz.courseTitle || 'Module Quiz'}
            </span>
            <span className="text-xs font-bold text-brand-dark/60">
              Pass Mark: {quiz.passScore || 60}%
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark">{quiz.title}</h1>
        </div>

        {/* Timer Widget */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-brand-dark shadow-brutal-sm font-black text-sm ${
            timeLeftSeconds < 120 ? 'bg-red-100 text-brand-red animate-pulse' : 'bg-cream-100 text-brand-dark'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Progress & Stepper */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-black text-brand-dark">
          <span>Question {currentIdx + 1} of {quiz.questions.length}</span>
          <span className="text-brand-blue">{answeredCount} of {quiz.questions.length} Answered</span>
        </div>
        <ProgressBar progress={progressPercent} max={100} color="gold" height="sm" />
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal-lg flex flex-col gap-6">
          <h2 className="text-lg sm:text-xl font-black text-brand-dark leading-relaxed">
            {currentQ.text}
          </h2>

          {/* Options List */}
          <div className="flex flex-col gap-3">
            {(currentQ.options || []).map((opt, optIndex) => {
              const optKey = typeof opt === 'object' && opt !== null ? opt.key : String.fromCharCode(97 + optIndex);
              const optText = typeof opt === 'object' && opt !== null ? opt.text : String(opt);
              const isSelected = answers[currentQ.id] === optKey;

              return (
                <div
                  key={optKey || optIndex}
                  onClick={() => handleSelectOption(currentQ.id, optKey)}
                  className={`p-4 rounded-2xl border-2 border-brand-dark cursor-pointer transition-all duration-150 flex items-center gap-3.5 select-none ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-brutal translate-x-1'
                      : 'bg-cream-50 hover:bg-cream-100 text-brand-dark'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl border-2 border-brand-dark flex items-center justify-center font-black text-xs shrink-0 uppercase ${
                      isSelected ? 'bg-brand-gold text-brand-dark' : 'bg-white text-brand-dark'
                    }`}
                  >
                    {optKey}
                  </div>
                  <span className="font-bold text-sm leading-snug">{optText}</span>
                </div>
              );
            })}
          </div>

          {/* Question Footer & Controls */}
          <div className="pt-6 border-t-2 border-cream-200 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            {currentIdx < quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentIdx((i) => i + 1)}
                icon={ArrowRight}
                className="font-black"
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="pink"
                size="md"
                onClick={handleSubmit}
                disabled={submitting}
                icon={Send}
                className="font-black animate-bounce-slight"
              >
                {submitting ? 'Evaluating...' : 'Submit Checkpoint Quiz 🚀'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
