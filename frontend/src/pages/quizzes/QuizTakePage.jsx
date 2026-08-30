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

  useEffect(() => {
    const loadQuiz = async () => {
      const data = await quizApi.getQuiz(quizId);
      setQuiz(data);
      if (data?.durationMinutes) {
        setTimeLeftSeconds(data.durationMinutes * 60);
      }
    };
    loadQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-3">🎯</div>
        <p className="font-bold text-brand-dark">Preparing Checkpoint Quiz...</p>
      </div>
    );
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
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

  const currentQ = quiz.questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIdx + 1) / quiz.questions.length) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Quiz Header Bar */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-5 sm:p-6 shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase bg-brand-gold px-2.5 py-0.5 rounded-full border border-brand-dark">
              {quiz.courseTitle || "Module Quiz"}
            </span>
            <span className="text-xs font-bold text-brand-dark/60">
              Pass Mark: {quiz.passPercentage}%
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
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal-lg flex flex-col gap-6">
        <h2 className="text-lg sm:text-xl font-black text-brand-dark leading-relaxed">
          {currentQ.text}
        </h2>

        {/* Options List */}
        <div className="flex flex-col gap-3">
          {currentQ.options.map((opt, optIndex) => {
            const isSelected = answers[currentQ.id] === optIndex;
            return (
              <div
                key={optIndex}
                onClick={() => handleSelectOption(currentQ.id, optIndex)}
                className={`p-4 rounded-2xl border-2 border-brand-dark cursor-pointer transition-all duration-150 flex items-center gap-3.5 select-none ${
                  isSelected
                    ? 'bg-brand-blue text-white shadow-brutal translate-x-1'
                    : 'bg-cream-50 hover:bg-cream-100 text-brand-dark'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl border-2 border-brand-dark flex items-center justify-center font-black text-xs shrink-0 ${
                    isSelected ? 'bg-brand-gold text-brand-dark' : 'bg-white text-brand-dark'
                  }`}
                >
                  {String.fromCharCode(65 + optIndex)}
                </div>
                <span className="font-bold text-sm leading-snug">{opt}</span>
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
    </div>
  );
};
