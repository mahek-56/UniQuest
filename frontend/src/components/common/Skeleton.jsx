import React from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variantStyles = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-cream-200 border border-brand-dark/20 ${variantStyles[variant]} ${className}`}
    />
  );
};

export const EmptyState = ({
  icon = "🎯",
  title = "Nothing Here Yet!",
  description = "Start your next quest or explore courses to make progress.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-cream-100/60 border-2 border-dashed border-brand-dark/30 rounded-3xl my-6">
      <div className="text-5xl sm:text-6xl mb-4 animate-bounce-slight">{icon}</div>
      <h4 className="text-xl sm:text-2xl font-black text-brand-dark mb-2">{title}</h4>
      <p className="text-sm font-medium text-brand-dark/70 max-w-md mb-6">{description}</p>
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const ErrorBanner = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-brand-red rounded-2xl shadow-brutal-sm text-brand-dark my-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-brand-red shrink-0" />
        <span className="text-sm font-bold text-brand-red">{message}</span>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} icon={RefreshCw}>
          Retry
        </Button>
      )}
    </div>
  );
};
