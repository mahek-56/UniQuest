import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Zap, X } from 'lucide-react';
import { Button } from '../common/Button';

export const CelebrationModal = ({ levelUpData, onClose }) => {
  if (!levelUpData) return null;
  const { newLevel, title, badge, bonusCoins } = levelUpData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md"
      />

      {/* Celebration Card */}
      <motion.div
        initial={{ scale: 0.5, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="relative w-full max-w-md bg-white border-4 border-brand-dark rounded-3xl p-6 sm:p-8 text-center shadow-brutal-lg z-10 overflow-hidden"
      >
        {/* Glow & Confetti background shapes */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand-gold rounded-full opacity-30 blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-brand-pink rounded-full opacity-30 blur-xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3.5 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-4 animate-bounce">
            <Sparkles className="w-4 h-4" /> Level Up! <Sparkles className="w-4 h-4" />
          </div>

          <div className="w-24 h-24 rounded-3xl bg-brand-gold border-4 border-brand-dark flex items-center justify-center text-5xl shadow-brutal mb-4 glow-gold">
            {badge || "👑"}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Level {newLevel}!
          </h2>

          <div className="inline-block bg-brand-dark text-white font-black text-sm uppercase px-4 py-1 rounded-full mt-2 mb-4 tracking-wider">
            {title}
          </div>

          <p className="text-sm font-semibold text-brand-dark/80 max-w-xs mb-6">
            Congratulations! You've unlocked new prestige and elevated your academic mastery!
          </p>

          <div className="flex items-center justify-center gap-2 bg-cream-100 border-2 border-brand-dark rounded-2xl px-5 py-3 mb-6 w-full shadow-brutal-sm">
            <span className="text-2xl">🪙</span>
            <span className="font-black text-base text-brand-dark">
              +{bonusCoins || 50} Coins Bonus Awarded!
            </span>
          </div>

          <Button
            variant="pink"
            size="lg"
            className="w-full font-black text-base"
            onClick={onClose}
          >
            Continue the Quest! 🚀
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const XPFloatingToastContainer = ({ toasts = [], onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-brand-dark shadow-brutal ${
              t.type === 'coin' ? 'bg-brand-gold text-brand-dark' : 'bg-brand-pink text-white'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-lg font-black shrink-0">
              {t.type === 'coin' ? '🪙' : '⚡'}
            </div>
            <div>
              <div className="font-black text-sm leading-none">
                +{t.amount} {t.type === 'coin' ? 'Coins' : 'XP'}
              </div>
              {t.reason && (
                <div className={`text-[11px] font-bold mt-0.5 ${t.type === 'coin' ? 'text-brand-dark/80' : 'text-rose-100'}`}>
                  {t.reason}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
