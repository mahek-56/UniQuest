import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Award, Flame, Zap, Clock, ShieldCheck, GraduationCap, Sparkles, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { Button } from '../../components/common/Button';
import { AchievementCard } from '../../components/gamification/AchievementCard';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { levelData, streak, coins, achievements } = useGamification();
  const navigate = useNavigate();

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-3 border-brand-dark bg-brand-gold overflow-hidden shadow-brutal shrink-0 glow-gold">
            <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">{user?.name}</h1>
              <span className="bg-brand-blue text-white text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                {levelData?.title}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-brand-dark/70 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-brand-blue" />
              {user?.department} • {user?.university}
            </p>
            <p className="text-xs text-brand-dark/50 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')} icon={Settings}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
            {levelData?.badge || "🧭"}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Current Level</span>
            <h3 className="text-xl sm:text-2xl font-black text-brand-dark">Level {levelData?.level}</h3>
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-pink text-white border-2 border-brand-dark flex items-center justify-center text-xl shadow-brutal-sm">
            🔥
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Active Streak</span>
            <h3 className="text-xl sm:text-2xl font-black text-brand-dark">{streak} Days</h3>
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cream-100 border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
            🪙
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Coin Balance</span>
            <h3 className="text-xl sm:text-2xl font-black text-brand-dark">{coins}</h3>
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-green border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Badges Unlocked</span>
            <h3 className="text-xl sm:text-2xl font-black text-brand-dark">{unlockedAchievements.length}</h3>
          </div>
        </div>
      </div>

      {/* Unlocked Badges Showcase */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎖️</span>
            <h2 className="font-black text-xl text-brand-dark">Unlocked Trophy Showcase</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/achievements')}>
            View All ({achievements.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {unlockedAchievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>
    </div>
  );
};
