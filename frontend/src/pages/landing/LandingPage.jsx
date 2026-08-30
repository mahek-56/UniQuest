import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Brain,
  Bot,
  RotateCcw,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50 text-brand-dark flex flex-col selection:bg-brand-gold selection:text-brand-dark overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b-3 border-brand-dark px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal transition-transform group-hover:scale-105 group-hover:rotate-3">
              🛡️
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-brand-dark leading-none">
                Uni<span className="text-brand-pink">Quest</span>
              </span>
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-brand-blue">
                Turn Learning Into a Quest
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="pink" size="sm" icon={Sparkles}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* Left Headline */}
        <div className="flex-1 flex flex-col items-start text-left z-10">
          <div className="inline-flex items-center gap-2 bg-brand-gold text-brand-dark font-black text-xs uppercase px-4 py-1.5 rounded-full border-2 border-brand-dark shadow-brutal-sm mb-6 animate-bounce-slight">
            <span>✨</span>
            <span>AI-Powered Gamified University Learning</span>
          </div>

          <h1 className="font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-brand-dark leading-[1.08] mb-6">
            Turn Learning <br />
            Into an <span className="text-brand-pink underline decoration-brand-gold decoration-wavy decoration-4">Epic Quest</span>.
          </h1>

          <p className="text-base sm:text-lg font-medium text-brand-dark/80 max-w-xl mb-8 leading-relaxed">
            UniQuest transforms monotonous university courses into interactive adventures. Complete daily quests, earn XP, maintain study streaks, get 24/7 AI Tutor guidance, and predict exam success with machine learning.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/register')}
              icon={ArrowRight}
            >
              Start Your Quest Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/login')}
            >
              Explore Demo Dashboard
            </Button>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t-2 border-brand-dark/15 text-xs font-black text-brand-dark/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-green" /> Spaced Repetition (SM-2)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-green" /> ML Exam Predictor
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-green" /> Real University CS Syllabi
            </span>
          </div>
        </div>

        {/* Right Hero Gamification Showcase Card */}
        <div className="flex-1 w-full max-w-lg relative">
          {/* Decorative Stickers */}
          <div className="absolute -top-4 -left-4 bg-brand-pink text-white border-2 border-brand-dark rounded-xl px-3 py-1 text-xs font-black uppercase shadow-brutal transform -rotate-6 z-20">
            🔥 7-DAY STREAK!
          </div>
          <div className="absolute -bottom-4 -right-4 bg-brand-gold text-brand-dark border-2 border-brand-dark rounded-xl px-3 py-1 text-xs font-black uppercase shadow-brutal transform rotate-3 z-20">
            +40 XP AWARDED!
          </div>

          {/* Main Showcase Panel */}
          <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-7 shadow-brutal-lg relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b-2 border-cream-200 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
                  🧭
                </div>
                <div>
                  <h3 className="font-black text-lg text-brand-dark">Level 12 • Explorer</h3>
                  <p className="text-xs font-bold text-brand-dark/60">1,240 / 1,400 XP</p>
                </div>
              </div>
              <div className="bg-brand-pink text-white font-black text-xs px-3 py-1.5 rounded-xl border border-brand-dark shadow-brutal-sm">
                🪙 480 Coins
              </div>
            </div>

            {/* Active Quest Preview */}
            <div className="bg-cream-50 border-2 border-brand-dark rounded-2xl p-4 shadow-brutal-sm mb-4">
              <div className="flex justify-between items-center text-xs font-black uppercase text-brand-dark mb-1">
                <span>Today's Quest</span>
                <span className="text-brand-pink">+40 XP</span>
              </div>
              <h4 className="font-black text-sm text-brand-dark">Complete 2 Database Lessons</h4>
              <div className="w-full bg-cream-200 border border-brand-dark rounded-full h-3 mt-2 overflow-hidden">
                <div className="bg-brand-gold h-full rounded-full w-2/3" />
              </div>
            </div>

            {/* AI Tutor Chat Snippet */}
            <div className="bg-blue-50/70 border-2 border-brand-blue rounded-2xl p-4 shadow-brutal-sm">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-brand-blue" />
                <span className="text-xs font-black text-brand-blue uppercase">AI Tutor Insight</span>
              </div>
              <p className="text-xs font-medium text-brand-dark">
                "In 3NF, transitive dependencies are eliminated. Notice how StudentID determines DeptID, which determines DeptBuilding!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Core Loop Section */}
      <section className="bg-cream-100 border-y-3 border-brand-dark py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-brand-dark text-white font-black text-xs uppercase px-4 py-1.5 rounded-full mb-3">
            The UniQuest Method
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-brand-dark mb-4">
            How The Quest Works
          </h2>
          <p className="text-sm sm:text-base font-medium text-brand-dark/70 max-w-2xl mx-auto mb-12">
            No more boring video bingeing. Learn concepts through bite-sized modules, prove mastery with checkpoint quizzes, and earn rewards at every step.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: "📖",
                title: "Learn Lessons",
                desc: "Concise, structured university modules covering DBMS, OS, AI, Networks & DSA.",
                color: "bg-brand-blue text-white",
              },
              {
                step: "02",
                icon: "🎯",
                title: "Conquer Quizzes",
                desc: "Real checkpoint quizzes that validate functional knowledge and grant XP bonuses.",
                color: "bg-brand-pink text-white",
              },
              {
                step: "03",
                icon: "⚡",
                title: "Level Up & Streak",
                desc: "Gain XP, unlock achievements, climb leaderboards, and build consistent habits.",
                color: "bg-brand-gold text-brand-dark",
              },
              {
                step: "04",
                icon: "🧠",
                title: "Smart Retention",
                desc: "SM-2 spaced repetition and ML diagnostics keep you exam-ready all semester.",
                color: "bg-brand-green text-brand-dark",
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="font-black text-xs px-2.5 py-1 rounded-full border border-brand-dark bg-cream-100 text-brand-dark">
                      STEP {s.step}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-brand-dark mb-2">{s.title}</h3>
                  <p className="text-xs font-medium text-brand-dark/75 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-black text-brand-dark mb-4">
            Packed with Superpowers for University Students
          </h2>
          <p className="text-sm sm:text-base font-medium text-brand-dark/70 max-w-2xl mx-auto">
            Engineered from ground up to solve student procrastination, fragmented revision, and exam anxiety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white border-3 border-brand-dark rounded-3xl p-7 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-pink text-white border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm mb-5">
                🤖
              </div>
              <h3 className="font-black text-xl text-brand-dark mb-2">24/7 AI Conceptual Tutor</h3>
              <p className="text-xs font-medium text-brand-dark/75 leading-relaxed">
                Stuck on BCNF decomposition or Banker's Algorithm? Ask the AI Tutor for simplified analogies, step-by-step traces, or exam practice hints.
              </p>
            </div>
          </div>

          <div className="bg-white border-3 border-brand-dark rounded-3xl p-7 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-gold text-brand-dark border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm mb-5">
                🧠
              </div>
              <h3 className="font-black text-xl text-brand-dark mb-2">SM-2 Spaced Repetition</h3>
              <p className="text-xs font-medium text-brand-dark/75 leading-relaxed">
                Never forget key definitions before midterms. Our intelligent revision engine schedules flashcard reviews right before memory fades.
              </p>
            </div>
          </div>

          <div className="bg-white border-3 border-brand-dark rounded-3xl p-7 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-green text-brand-dark border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm mb-5">
                📊
              </div>
              <h3 className="font-black text-xl text-brand-dark mb-2">ML Exam Predictor</h3>
              <p className="text-xs font-medium text-brand-dark/75 leading-relaxed">
                Random Forest intelligence calculates your probability of achieving top grades and provides actionable fixes for weak topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High Energy CTA */}
      <section className="px-4 sm:px-8 pb-20 max-w-7xl mx-auto w-full">
        <div className="bg-brand-blue text-white border-4 border-brand-dark rounded-3xl p-8 sm:p-14 shadow-brutal-lg relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-brand-pink rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-brand-gold rounded-full opacity-30 blur-2xl" />

          <div className="relative z-10 max-w-2xl flex flex-col items-center">
            <span className="text-4xl mb-3">🎓</span>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight">
              Ready to Level Up Your Semester?
            </h2>
            <p className="text-sm sm:text-base font-medium text-blue-100 mb-8">
              Join thousands of university students making study sessions fun, measurable, and extraordinarily effective.
            </p>
            <Button
              variant="gold"
              size="lg"
              className="text-brand-dark font-black text-base px-8 py-4"
              onClick={() => navigate('/register')}
              icon={Sparkles}
            >
              Create Free Student Account 🚀
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-brand-dark text-white py-10 px-4 sm:px-8 border-t-3 border-brand-dark">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>UniQuest © 2026. Turn Learning Into a Quest.</span>
          </div>
          <div className="flex items-center gap-6 text-cream-200">
            <Link to="/courses" className="hover:text-brand-gold">Courses</Link>
            <Link to="/leaderboard" className="hover:text-brand-gold">Leaderboard</Link>
            <Link to="/ai-tutor" className="hover:text-brand-gold">AI Tutor</Link>
            <Link to="/login" className="hover:text-brand-gold">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
