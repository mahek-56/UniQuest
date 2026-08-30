import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Flame, Zap } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle, sticker = "QUEST AWAITS" }) => {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Playful background decorative shapes */}
      <div className="absolute top-10 left-10 text-6xl select-none opacity-25 animate-float hidden md:block">
        🧭
      </div>
      <div className="absolute bottom-10 right-10 text-6xl select-none opacity-25 animate-bounce-slight hidden md:block">
        👑
      </div>
      <div className="absolute top-1/3 right-12 text-5xl select-none opacity-20 hidden lg:block">
        ⚡
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 text-center z-10">
        <Link to="/" className="flex items-center gap-3 group mb-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal transition-transform group-hover:scale-105 group-hover:rotate-3">
            🛡️
          </div>
          <h1 className="font-black text-3xl sm:text-4xl text-brand-dark tracking-tight">
            Uni<span className="text-brand-pink">Quest</span>
          </h1>
        </Link>
        <p className="text-xs font-black uppercase tracking-widest text-brand-blue">
          Turn Learning Into a Quest
        </p>
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal-lg z-10">
        {/* Sticker */}
        <div className="absolute -top-3.5 right-6 bg-brand-pink text-white border border-brand-dark px-3 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider shadow-brutal-sm transform rotate-2">
          {sticker}
        </div>

        <div className="mb-6 text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark">{title}</h2>
          {subtitle && <p className="text-xs font-medium text-brand-dark/70 mt-1">{subtitle}</p>}
        </div>

        {children}
      </div>

      {/* Footer link */}
      <div className="mt-8 text-center text-xs font-bold text-brand-dark/60 z-10">
        UniQuest • The AI-Powered Gamified University LMS
      </div>
    </div>
  );
};
