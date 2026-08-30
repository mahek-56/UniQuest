import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'pink' | 'gold' | 'green' | 'paper' | 'outline' | 'ghost'
  size = 'md',        // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-brand-blue text-white hover:bg-blue-700 active:shadow-none shadow-brutal',
    pink: 'bg-brand-pink text-white hover:brightness-110 active:shadow-none shadow-brutal',
    gold: 'bg-brand-gold text-brand-dark hover:bg-yellow-400 active:shadow-none shadow-brutal',
    green: 'bg-brand-green text-brand-dark hover:brightness-105 active:shadow-none shadow-brutal',
    paper: 'bg-brand-paper text-brand-dark hover:bg-white active:shadow-none shadow-brutal',
    outline: 'bg-white text-brand-dark hover:bg-cream-100 active:shadow-none shadow-brutal',
    ghost: 'bg-transparent text-brand-dark border-transparent hover:bg-cream-200/60 shadow-none',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-2xl font-black',
  };

  const disabledStyles = disabled
    ? 'opacity-50 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0'
    : 'active:translate-x-0.5 active:translate-y-0.5 cursor-pointer';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 font-bold border-2 border-brand-dark transition-all duration-150 select-none ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${disabledStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};
