import React from 'react';
import { Sparkles, Flame, Coins } from 'lucide-react';
import { formatNumber } from '../../utils/gamificationUtils';

export const LevelBadge = ({ level = 1, title = "Beginner", badge = "🎒", size = "md" }) => {
  const sizeMap = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-1.5 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-3 font-black",
  };

  return (
    <div
      className={`inline-flex items-center font-black bg-brand-gold text-brand-dark border-2 border-brand-dark rounded-xl shadow-brutal-sm ${sizeMap[size]}`}
    >
      <span className="text-base sm:text-lg">{badge}</span>
      <div className="flex items-center gap-1.5 leading-none">
        <span className="text-xs uppercase opacity-75 font-extrabold">Lvl</span>
        <span className="font-black text-sm sm:text-base">{level}</span>
        <span className="hidden sm:inline-block text-xs bg-brand-dark text-white px-2 py-0.5 rounded-full font-bold">
          {title}
        </span>
      </div>
    </div>
  );
};

export const CoinCounter = ({ coins = 0, size = "md" }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-white text-brand-dark font-black px-3 py-1.5 border-2 border-brand-dark rounded-xl shadow-brutal-sm select-none">
      <span className="text-base">🪙</span>
      <span className="text-sm font-extrabold">{formatNumber(coins)}</span>
    </div>
  );
};

export const StreakCard = ({ streak = 7, compact = false }) => {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-brand-pink text-white font-black px-3 py-1.5 border-2 border-brand-dark rounded-xl shadow-brutal-sm">
        <span className="text-base animate-pulse">🔥</span>
        <span className="text-sm">{streak}d</span>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-brand-pink to-rose-600 text-white border-3 border-brand-dark rounded-2xl p-5 shadow-brutal overflow-hidden">
      <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 select-none">
        🔥
      </div>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-xs font-black uppercase tracking-wider bg-brand-dark/30 px-2.5 py-0.5 rounded-full">
          Active Streak
        </span>
        <span className="text-2xl animate-bounce-slight">🔥</span>
      </div>
      <div className="relative z-10">
        <div className="text-3xl sm:text-4xl font-black">{streak} Days</div>
        <p className="text-xs font-semibold text-rose-100 mt-1">
          {streak >= 7 ? "You're unstoppable! Keep the flame burning!" : "Study today to keep your streak alive!"}
        </p>
      </div>
    </div>
  );
};
