import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Globe, School, Building2, Flame } from 'lucide-react';
import { gamificationApi } from '../../services/gamificationApi';
import { LeaderboardPodium, LeaderboardRow } from '../../components/gamification/LeaderboardPodium';

export const LeaderboardPage = () => {
  const [scope, setScope] = useState('weekly'); // 'weekly' | 'university' | 'department'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await gamificationApi.getLeaderboard(scope);
        setEntries(Array.isArray(data) ? data : (data?.entries || []));
      } catch (e) {
        console.error("Error loading leaderboard:", e);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, [scope]);

  const safeEntries = Array.isArray(entries) ? entries : [];
  const topThree = safeEntries.slice(0, 3);
  const remaining = safeEntries.slice(3);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3.5 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
          <Crown className="w-4 h-4" /> Global Academic Arena
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
          Campus & Global Leaderboards
        </h1>
        <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-lg">
          Compete against classmates, university peers, and students worldwide. Top 3 scholars earn weekly trophy rewards!
        </p>

        {/* Scope Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { label: 'Weekly Global', value: 'weekly', icon: Globe },
            { label: 'My University', value: 'university', icon: School },
            { label: 'My Department', value: 'department', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setScope(tab.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border-2 border-brand-dark transition-all cursor-pointer ${
                  scope === tab.value
                    ? 'bg-brand-blue text-white shadow-brutal scale-105'
                    : 'bg-cream-100 text-brand-dark hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && <LeaderboardPodium topThree={topThree} />}

      {/* Remaining Rankings List */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-4 sm:p-6 shadow-brutal flex flex-col gap-3">
        <div className="flex items-center justify-between pb-3 border-b-2 border-cream-200 text-xs font-black text-brand-dark/60 uppercase">
          <span>Rank & Student</span>
          <span>Weekly Score</span>
        </div>

        {safeEntries.length === 0 && !loading && (
          <div className="text-center py-8 font-bold text-brand-dark/60 text-sm">
            No scholars on the leaderboard for this category yet. Start studying to claim the #1 spot!
          </div>
        )}

        {safeEntries.map((entry, idx) => (
          <LeaderboardRow key={entry.rank || entry.user_id || idx} entry={entry} />
        ))}
      </div>
    </div>
  );
};
