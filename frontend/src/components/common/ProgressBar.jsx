import React from 'react';

export const ProgressBar = ({
  progress = 0,
  max = 100,
  color = 'gold', // 'gold' | 'pink' | 'green' | 'blue'
  showLabel = false,
  label = '',
  height = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((progress / max) * 100)));

  const colorStyles = {
    gold: 'bg-brand-gold',
    pink: 'bg-brand-pink',
    green: 'bg-brand-green',
    blue: 'bg-brand-blue',
    cyan: 'bg-brand-cyan',
  };

  const heightStyles = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-black uppercase text-brand-dark">
          <span>{label || 'Progress'}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        className={`w-full bg-cream-200 border-2 border-brand-dark rounded-full overflow-hidden p-0.5 shadow-brutal-sm ${heightStyles[height] || heightStyles.md}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out border-r border-brand-dark/20 ${
            colorStyles[color] || colorStyles.gold
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
