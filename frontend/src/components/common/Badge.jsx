import React from 'react';

export const Badge = ({
  children,
  variant = 'gold', // 'pink' | 'gold' | 'green' | 'blue' | 'cyan' | 'dark' | 'paper'
  size = 'md',      // 'sm' | 'md'
  className = '',
  icon: Icon,
}) => {
  const variantStyles = {
    pink: 'bg-brand-pink text-white',
    gold: 'bg-brand-gold text-brand-dark',
    green: 'bg-brand-green text-brand-dark',
    blue: 'bg-brand-blue text-white',
    cyan: 'bg-brand-cyan text-brand-dark',
    dark: 'bg-brand-dark text-white',
    paper: 'bg-brand-paper text-brand-dark',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-extrabold uppercase tracking-wide rounded-full border border-brand-dark shadow-brutal-sm ${variantStyles[variant] || variantStyles.gold} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};
