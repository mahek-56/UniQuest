import React, { useState } from 'react';
import { Trophy, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { AchievementCard } from '../../components/gamification/AchievementCard';

export const AchievementsPage = () => {
  const { achievements } = useGamification();
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Learning', 'Quizzes', 'Consistency', 'Milestone', 'AI', 'Revision'];

  const filtered = achievements.filter((a) => {
    if (categoryFilter === 'All') return true;
    return a.category === categoryFilter;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <span>🏆</span>
            <span>Hall of Achievements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Badges & Milestones
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Unlock prestige trophies by demonstrating continuous learning, streak mastery, and quiz accuracy.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-4 bg-cream-100 border-2 border-brand-dark rounded-2xl p-4 shadow-brutal-sm shrink-0">
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-green">{unlockedCount} / {achievements.length}</span>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Unlocked</span>
          </div>
          <div className="h-8 w-0.5 bg-brand-dark/20" />
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-gold">
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </span>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Showcase</span>
          </div>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-brand-dark transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-brand-blue text-white shadow-brutal-sm scale-105'
                : 'bg-white text-brand-dark hover:bg-cream-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((ach) => (
          <AchievementCard key={ach.id} achievement={ach} />
        ))}
      </div>
    </div>
  );
};
