import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="font-extrabold text-xs uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-brand-dark/60 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-cream-50 text-brand-dark font-medium border-2 border-brand-dark rounded-xl px-4 py-2.5 shadow-brutal-sm placeholder:text-brand-dark/40 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-brand-red ring-1 ring-brand-red' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-bold text-brand-red">{error}</p>}
      {helperText && !error && <p className="text-xs text-brand-dark/70 font-medium">{helperText}</p>}
    </div>
  );
};

export const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="font-extrabold text-xs uppercase tracking-wider text-brand-dark">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full bg-cream-50 text-brand-dark font-bold border-2 border-brand-dark rounded-xl px-4 py-2.5 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition-all cursor-pointer ${
          error ? 'border-brand-red' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-brand-dark font-semibold">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-bold text-brand-red">{error}</p>}
    </div>
  );
};
