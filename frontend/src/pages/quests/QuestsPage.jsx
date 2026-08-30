import React, { useState } from 'react';
import { Target, Sparkles, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { QuestCard } from '../../components/gamification/QuestCard';
import { Button } from '../../components/common/Button';

export const QuestsPage = () => {
  const { quests, claimQuest } = useGamification();
  const [filter, setFilter] = useState('all'); // 'all' | 'daily' | 'weekly'

  const filtered = quests.filter((q) => {
    if (filter === 'daily') return q.type === 'daily';
    if (filter === 'weekly') return q.type === 'weekly';
    return true;
  });

  const dailyQuests = quests.filter((q) => q.type === 'daily');
  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <span>🎯</span>
            <span>Daily & Weekly Objectives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Quest Headquarters
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Complete daily study targets, quizzes, and focus sessions to unlock massive XP bonuses and coins.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-4 bg-cream-100 border-2 border-brand-dark rounded-2xl p-4 shadow-brutal-sm shrink-0">
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-pink">{completedCount}/{quests.length}</span>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Completed</span>
          </div>
          <div className="h-8 w-0.5 bg-brand-dark/20" />
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-blue">14h 22m</span>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Reset Timer</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All Quests', value: 'all' },
          { label: 'Daily Quests', value: 'daily' },
          { label: 'Weekly Quests', value: 'weekly' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-brand-dark transition-all cursor-pointer ${
              filter === tab.value
                ? 'bg-brand-blue text-white shadow-brutal-sm scale-105'
                : 'bg-white text-brand-dark hover:bg-cream-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((quest) => (
          <QuestCard key={quest.id} quest={quest} onClaim={claimQuest} />
        ))}
      </div>
    </div>
  );
};
