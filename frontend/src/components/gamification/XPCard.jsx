import React from 'react';
import { Zap } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { formatNumber } from '../../utils/gamificationUtils';

export const XPCard = ({ levelData }) => {
  const {
    level,
    title,
    badge,
    totalXP,
    xpInCurrentLevel,
    xpRequiredForNext,
    remainingXP,
    progressPercent,
  } = levelData || {};

  return (
    <div className="relative bg-white border-3 border-brand-dark rounded-3xl p-5 sm:p-6 shadow-brutal overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cream-100 rounded-bl-full -z-0 opacity-60 border-l border-b border-brand-dark/10" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
              {badge || "🧭"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-brand-dark">Level {level}</h3>
                <span className="bg-brand-dark text-white text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {title}
                </span>
              </div>
              <p className="text-xs font-bold text-brand-dark/60 mt-0.5">
                {formatNumber(totalXP)} Total Lifetime XP
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-cream-100 border border-brand-dark px-3 py-1.5 rounded-xl text-xs font-black text-brand-dark">
            <Zap className="w-4 h-4 text-brand-pink fill-brand-pink" />
            <span>{remainingXP} XP to Level {level + 1}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-black text-brand-dark">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
              {xpInCurrentLevel} / {xpRequiredForNext} XP
            </span>
            <span className="text-brand-blue font-extrabold">{progressPercent}%</span>
          </div>
          <ProgressBar progress={progressPercent} max={100} color="gold" height="md" />
        </div>
      </div>
    </div>
  );
};
