import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  X
} from 'lucide-react';
import { courseApi } from '../../services/courseApi';
import { aiApi } from '../../services/aiApi';
import { useGamification } from '../../context/GamificationContext';
import { Button } from '../../components/common/Button';

export const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { addXP, refreshStats } = useGamification();

  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState([]);

  useEffect(() => {
    const loadLesson = async () => {
      const data = await courseApi.getLesson(lessonId);
      setLesson(data);
      setCompleted(data?.completed || false);
    };
    loadLesson();
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin text-4xl mb-3">📖</div>
        <p className="font-bold text-brand-dark">Loading Lesson Canvas...</p>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!completed) {
      await courseApi.completeLesson(lesson.id);
      setCompleted(true);
      addXP(lesson.xp || 20, `Completed: ${lesson.title}`);
      await refreshStats();
    }
  };

  const handleAskAI = async (customPrompt) => {
    const q = customPrompt || aiQuestion;
    if (!q.trim()) return;

    setAiLoading(true);
    setAiConversation(prev => [...prev, { sender: 'user', text: q }]);
    setAiQuestion('');

    try {
      const res = await aiApi.askTutor({
        message: q,
        subject: lesson.courseTitle || "Computer Science",
      });
      setAiConversation(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (e) {
      setAiConversation(prev => [
        ...prev,
        { sender: 'ai', text: "I'm having a brief connection glitch. Please try asking again!" }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto relative">
      {/* Main Lesson Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/courses/${lesson.courseId}`)}
            className="inline-flex items-center gap-1.5 text-xs font-black text-brand-dark/70 hover:text-brand-dark cursor-pointer bg-cream-100 border border-brand-dark px-3 py-1.5 rounded-xl shadow-brutal-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {lesson.courseTitle || "Back to Course"}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
              className="inline-flex items-center gap-1.5 bg-brand-pink text-white text-xs font-black px-3.5 py-1.5 rounded-xl border-2 border-brand-dark shadow-brutal-sm cursor-pointer hover:brightness-110"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Lesson Canvas Card */}
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-10 shadow-brutal-lg flex flex-col gap-6">
          {/* Lesson Metadata */}
          <div className="pb-6 border-b-2 border-cream-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cream-100 text-brand-dark text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-brand-dark">
                {lesson.moduleTitle}
              </span>
              <span className="text-xs font-bold text-brand-dark/60 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {lesson.duration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight">
              {lesson.title}
            </h1>
          </div>

          {/* Rendered Lesson Body */}
          <div className="prose max-w-none text-brand-dark leading-relaxed font-medium space-y-4">
            <div className="p-4 bg-cream-50 border-2 border-brand-dark rounded-2xl text-xs sm:text-sm font-semibold">
              💡 <span className="font-bold">Core Learning Objective:</span> Master relational concepts, functional keys, and normal forms to design high-performance schemas.
            </div>

            <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
              {lesson.content}
            </div>

            {/* Practical Code Example Callout */}
            <div className="my-6 p-5 bg-brand-dark text-white rounded-2xl border-2 border-brand-dark shadow-brutal font-mono text-xs overflow-x-auto">
              <div className="text-brand-gold font-bold mb-2">// SQL Constraint Example</div>
              <code>
                {`ALTER TABLE Students\nADD CONSTRAINT chk_student_status\nCHECK (enrollment_status IN ('ACTIVE', 'PROBATION', 'GRADUATED'));`}
              </code>
            </div>
          </div>

          {/* Lesson Completion Action Bar */}
          <div className="pt-6 border-t-2 border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-brand-pink flex items-center gap-1">
                <Zap className="w-4 h-4 fill-brand-pink" /> +{lesson.xp || 20} XP on Completion
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {completed ? (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border-2 border-brand-green rounded-xl text-xs font-black text-brand-green">
                  <CheckCircle2 className="w-4 h-4" /> Lesson Completed
                </div>
              ) : (
                <Button
                  variant="gold"
                  size="md"
                  onClick={handleComplete}
                  icon={CheckCircle2}
                  className="w-full sm:w-auto font-black"
                >
                  Mark Complete & Earn +20 XP 🎉
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/quizzes/quiz-dbms-2')}
                icon={ArrowRight}
                className="w-full sm:w-auto font-black"
              >
                Next Checkpoint Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tutor Assistant Sidebar (Collapsible) */}
      {aiSidebarOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l-3 border-brand-dark p-5 shadow-brutal-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-cream-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-black text-base text-brand-dark">AI Tutor Helper</h3>
                  <span className="text-[10px] font-bold text-brand-blue uppercase">Context: {lesson.title}</span>
                </div>
              </div>
              <button
                onClick={() => setAiSidebarOpen(false)}
                className="p-1 rounded-lg border border-brand-dark hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Presets */}
            <div className="flex flex-col gap-1.5 mb-4">
              <span className="text-[10px] font-black uppercase text-brand-dark/60">Quick Prompts:</span>
              <button
                onClick={() => handleAskAI("Explain this concept with a real-life analogy.")}
                className="text-left text-xs font-bold p-2 rounded-xl bg-cream-100 border border-brand-dark hover:bg-brand-gold/40 transition-colors"
              >
                💡 Explain with a simple real-life analogy
              </button>
              <button
                onClick={() => handleAskAI("How would this be tested on a university midterm exam?")}
                className="text-left text-xs font-bold p-2 rounded-xl bg-cream-100 border border-brand-dark hover:bg-brand-gold/40 transition-colors"
              >
                📝 How will this be tested on my exam?
              </button>
            </div>

            {/* Chat Conversation Stream */}
            <div className="max-h-[50vh] overflow-y-auto flex flex-col gap-3 pr-1">
              {aiConversation.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border text-xs font-medium ${
                    msg.sender === 'user'
                      ? 'bg-brand-blue text-white border-brand-dark self-end ml-4'
                      : 'bg-cream-50 text-brand-dark border-brand-dark self-start mr-2'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="p-3 rounded-2xl bg-cream-100 text-xs font-bold text-brand-dark animate-pulse">
                  AI Tutor is thinking... 💭
                </div>
              )}
            </div>
          </div>

          {/* Question Input */}
          <div className="pt-4 border-t border-cream-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask about this lesson..."
                className="flex-1 bg-cream-50 border-2 border-brand-dark rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
              <Button type="submit" variant="pink" size="sm" disabled={aiLoading}>
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
