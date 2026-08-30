import React from 'react';
import { Crown, Flame, Zap } from 'lucide-react';
import { formatNumber } from '../../utils/gamificationUtils';

export const LeaderboardPodium = ({ topThree = [] }) => {
  const [first, second, third] = [topThree[0], topThree[1], topThree[2]];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 max-w-2xl mx-auto">
      {/* 2nd Place */}
      {second && (
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-brand-dark bg-white shadow-brutal overflow-hidden">
              <img src={second.avatar} alt={second.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-3 -right-2 bg-slate-300 border-2 border-brand-dark rounded-full w-7 h-7 flex items-center justify-center font-black text-xs shadow-brutal-sm">
              2
            </div>
          </div>
          <span className="font-black text-xs sm:text-sm text-brand-dark text-center line-clamp-1">
            {second.name}
          </span>
          <span className="text-[11px] font-bold text-brand-dark/70">{formatNumber(second.xp)} XP</span>

          {/* Podium Pillar */}
          <div className="w-full bg-slate-200 border-2 border-brand-dark rounded-t-2xl h-24 sm:h-32 mt-3 flex items-center justify-center font-black text-2xl text-brand-dark shadow-brutal-sm">
            🥈
          </div>
        </div>
      )}

      {/* 1st Place */}
      {first && (
        <div className="flex flex-col items-center -mt-6">
          <div className="relative mb-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-brand-gold animate-bounce-slight">
              <Crown className="w-8 h-8 fill-brand-gold text-brand-dark stroke-[2.5]" />
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-brand-dark bg-brand-gold shadow-brutal-lg overflow-hidden glow-gold">
              <img src={first.avatar} alt={first.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-2 -right-2 bg-brand-gold border-2 border-brand-dark rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-brutal-sm">
              1
            </div>
          </div>
          <span className="font-black text-sm sm:text-base text-brand-dark text-center line-clamp-1">
            {first.name}
          </span>
          <span className="text-xs font-black text-brand-pink flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-brand-pink" /> {formatNumber(first.xp)} XP
          </span>

          {/* Podium Pillar */}
          <div className="w-full bg-brand-gold border-2 border-brand-dark rounded-t-2xl h-32 sm:h-44 mt-3 flex items-center justify-center font-black text-3xl text-brand-dark shadow-brutal">
            🥇
          </div>
        </div>
      )}

      {/* 3rd Place */}
      {third && (
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-brand-dark bg-white shadow-brutal overflow-hidden">
              <img src={third.avatar} alt={third.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-3 -right-2 bg-amber-600 text-white border-2 border-brand-dark rounded-full w-7 h-7 flex items-center justify-center font-black text-xs shadow-brutal-sm">
              3
            </div>
          </div>
          <span className="font-black text-xs sm:text-sm text-brand-dark text-center line-clamp-1">
            {third.name}
          </span>
          <span className="text-[11px] font-bold text-brand-dark/70">{formatNumber(third.xp)} XP</span>

          {/* Podium Pillar */}
          <div className="w-full bg-amber-200 border-2 border-brand-dark rounded-t-2xl h-20 sm:h-24 mt-3 flex items-center justify-center font-black text-xl text-brand-dark shadow-brutal-sm">
            🥉
          </div>
        </div>
      )}
    </div>
  );
};

export const LeaderboardRow = ({ entry }) => {
  const { rank, name, university, department, avatar, xp, level, streak, isCurrentUser, badge } = entry;

  return (
    <div
      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 border-brand-dark transition-all duration-150 ${
        isCurrentUser
          ? 'bg-brand-blue text-white shadow-brutal scale-[1.01] sticky bottom-3 z-20'
          : 'bg-white text-brand-dark shadow-brutal-sm hover:bg-cream-50'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span
          className={`w-7 sm:w-8 text-center font-black text-sm sm:text-base ${
            isCurrentUser ? 'text-brand-gold' : rank <= 3 ? 'text-brand-pink' : 'text-brand-dark/60'
          }`}
        >
          #{rank}
        </span>

        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-brand-dark bg-cream-100 overflow-hidden shrink-0">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm sm:text-base truncate">{name}</h4>
            {badge && (
              <span
                className={`hidden md:inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isCurrentUser
                    ? 'bg-white/20 border-white text-white'
                    : 'bg-cream-100 border-brand-dark text-brand-dark'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className={`text-xs truncate ${isCurrentUser ? 'text-blue-100' : 'text-brand-dark/60'}`}>
            {department} • Lvl {level}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {streak > 0 && (
          <div className="hidden sm:flex items-center gap-1 font-bold text-xs">
            <span>🔥</span>
            <span>{streak}d</span>
          </div>
        )}
        <div className="text-right">
          <div className="font-black text-sm sm:text-base">{formatNumber(xp)} XP</div>
        </div>
      </div>
    </div>
  );
};
