import React from 'react';
import { CheckCircle2, Clock, Gift, Zap } from 'lucide-react';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

export const QuestCard = ({ quest, onClaim }) => {
  const {
    id,
    title,
    description,
    current,
    target,
    xpReward,
    coinReward,
    completed,
    claimed,
    category,
    icon,
    expiresIn,
  } = quest;

  const percent = Math.min(100, Math.round((current / target) * 100));
  const isReadyToClaim = completed && !claimed;

  return (
    <div
      className={`relative bg-white border-2 border-brand-dark rounded-2xl p-4 sm:p-5 shadow-brutal transition-all duration-200 flex flex-col justify-between gap-4 ${
        claimed ? 'opacity-65 bg-cream-50' : isReadyToClaim ? 'ring-2 ring-brand-gold glow-gold' : ''
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{icon || "🎯"}</span>
            <span className="text-[11px] font-black uppercase tracking-wider bg-cream-100 border border-brand-dark px-2 py-0.5 rounded-full text-brand-dark">
              {category}
            </span>
          </div>

          {expiresIn && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-dark/60">
              <Clock className="w-3 h-3" />
              <span>{expiresIn}</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h4 className="font-black text-base sm:text-lg text-brand-dark leading-snug">{title}</h4>
        <p className="text-xs font-medium text-brand-dark/75 mt-1">{description}</p>
      </div>

      {/* Progress & Reward Footer */}
      <div className="flex flex-col gap-3 pt-2 border-t border-cream-200">
        <div className="flex items-center justify-between text-xs font-black text-brand-dark">
          <span>{current} / {target}</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-brand-pink font-extrabold">
              <Zap className="w-3 h-3 fill-brand-pink" /> +{xpReward} XP
            </span>
            <span className="inline-flex items-center gap-1 text-brand-dark font-extrabold">
              🪙 +{coinReward}
            </span>
          </div>
        </div>

        <ProgressBar progress={percent} max={100} color={completed ? "green" : "gold"} height="sm" />

        {isReadyToClaim ? (
          <Button
            variant="gold"
            size="sm"
            className="w-full font-black animate-bounce-slight"
            onClick={() => onClaim(id)}
            icon={Gift}
          >
            Claim Reward! 🎉
          </Button>
        ) : claimed ? (
          <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-black text-brand-green bg-green-50 border border-brand-green rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span>Reward Claimed</span>
          </div>
        ) : (
          <div className="text-[11px] font-bold text-center text-brand-dark/50 py-1">
            In Progress ({percent}%)
          </div>
        )}
      </div>
    </div>
  );
};
