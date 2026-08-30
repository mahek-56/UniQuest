import React from 'react';

export const Card = ({
  children,
  className = '',
  sticker,
  stickerColor = 'pink',
  interactive = false,
  onClick,
  accentColor,
  ...props
}) => {
  const stickerColors = {
    pink: 'bg-brand-pink text-white',
    gold: 'bg-brand-gold text-brand-dark',
    green: 'bg-brand-green text-brand-dark',
    cyan: 'bg-brand-cyan text-brand-dark',
    blue: 'bg-brand-blue text-white',
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white border-2 border-brand-dark rounded-2xl shadow-brutal p-5 sm:p-6 transition-all duration-200 ${
        interactive ? 'hover:-translate-y-1 hover:shadow-brutal-lg cursor-pointer' : ''
      } ${className}`}
      style={accentColor ? { borderTop: `6px solid ${accentColor}` } : {}}
      {...props}
    >
      {sticker && (
        <div
          className={`absolute -top-3 right-4 px-3 py-0.5 rounded-md border border-brand-dark text-xs font-black uppercase tracking-wider shadow-brutal-sm transform rotate-2 ${
            stickerColors[stickerColor] || stickerColors.pink
          }`}
        >
          {sticker}
        </div>
      )}
      {children}
    </div>
  );
};
