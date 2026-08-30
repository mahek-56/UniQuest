import React from 'react';
import { Lock, Check, Zap } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const AchievementCard = ({ achievement }) => {
  const {
    id,
    title,
    description,
    category,
    icon,
    rarity,
    xpReward,
    unlocked,
    unlockedAt,
    progress,
    target,
  } = achievement;

  const rarityStyles = {
    Common: "bg-cream-100 text-brand-dark border-brand-dark",
    Rare: "bg-cyan-100 text-brand-dark border-brand-dark",
    Epic: "bg-purple-100 text-brand-dark border-brand-dark",
    Legendary: "bg-amber-100 text-amber-900 border-amber-500",
  };

  const percent = Math.min(100, Math.round(((progress || 0) / (target || 1)) * 100));

  return (
    <div
      className={`relative bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex flex-col justify-between gap-4 transition-all duration-200 ${
        unlocked ? 'hover:-translate-y-1' : 'opacity-70 bg-cream-50/50'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-14 h-14 rounded-2xl border-2 border-brand-dark flex items-center justify-center text-3xl shadow-brutal-sm ${
              unlocked ? 'bg-brand-gold' : 'bg-gray-200 grayscale'
            }`}
          >
            {icon || "🏆"}
          </div>

          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-brutal-sm ${
              rarityStyles[rarity] || rarityStyles.Common
            }`}
          >
            {rarity}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <h4 className="font-black text-base text-brand-dark">{title}</h4>
          {unlocked && <Check className="w-4 h-4 text-brand-green shrink-0 stroke-[3]" />}
        </div>
        <p className="text-xs font-medium text-brand-dark/70 mt-1">{description}</p>
      </div>

      <div className="pt-3 border-t border-cream-200 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-black text-brand-dark">
          <span className="flex items-center gap-1 text-brand-pink">
            <Zap className="w-3 h-3 fill-brand-pink" /> +{xpReward} XP
          </span>

          {unlocked ? (
            <span className="text-[11px] font-bold text-brand-green">
              Unlocked {unlockedAt || ""}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-brand-dark/60 text-[11px]">
              <Lock className="w-3 h-3" />
              {progress} / {target}
            </span>
          )}
        </div>

        {!unlocked && (
          <ProgressBar progress={percent} max={100} color="gold" height="sm" />
        )}
      </div>
    </div>
  );
};
