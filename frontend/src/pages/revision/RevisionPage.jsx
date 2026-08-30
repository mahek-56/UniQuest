import React, { useState, useEffect } from 'react';
import { RotateCcw, Brain, CheckCircle2, Sparkles, HelpCircle, Eye, EyeOff, Zap } from 'lucide-react';
import { revisionApi } from '../../services/revisionApi';
import { useGamification } from '../../context/GamificationContext';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';

export const RevisionPage = () => {
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedSessionCount, setReviewedSessionCount] = useState(0);
  const { addXP, refreshStats } = useGamification();

  useEffect(() => {
    const loadCards = async () => {
      const data = await revisionApi.getDue();
      setCards(data);
    };
    loadCards();
  }, []);

  const dueCards = cards.filter(c => c.dueToday);
  const activeCard = dueCards[currentIdx];

  const handleRate = async (rating) => {
    if (!activeCard) return;

    await revisionApi.reviewTopic(activeCard.id, rating);
    addXP(15, `Revised: ${activeCard.topic}`);
    await refreshStats();
    setReviewedSessionCount(prev => prev + 1);
    setShowAnswer(false);

    if (currentIdx < dueCards.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Reload fresh list
      const updated = await revisionApi.getDue();
      setCards(updated);
      setCurrentIdx(0);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <Brain className="w-4 h-4" /> SM-2 Spaced Repetition Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Smart Concept Revision
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Retain crucial computer science definitions, invariants, and algorithms long-term through optimized spaced recall.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 bg-cream-100 border-2 border-brand-dark rounded-2xl p-4 shadow-brutal-sm shrink-0">
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-pink">{dueCards.length}</span>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Due Today</span>
          </div>
          <div className="h-8 w-0.5 bg-brand-dark/20" />
          <div className="text-center">
            <span className="block text-2xl font-black text-brand-green">{cards.length - dueCards.length}</span>
            <span className="text-[10px] font-black uppercase text-brand-dark/60">Mastered</span>
          </div>
        </div>
      </div>

      {/* Interactive Active Recall Flashcard */}
      {activeCard ? (
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-10 shadow-brutal-lg flex flex-col gap-6">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-cream-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase bg-cream-100 border border-brand-dark px-2.5 py-0.5 rounded-full text-brand-dark">
                {activeCard.subject}
              </span>
              <span className="text-xs font-bold text-brand-dark/60">
                Card {currentIdx + 1} of {dueCards.length}
              </span>
            </div>

            <span className="text-xs font-black text-brand-pink flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-brand-pink" /> +15 XP per card
            </span>
          </div>

          {/* Flashcard Question Prompt */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark/50">Concept Recall:</span>
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark leading-snug">
              {activeCard.question}
            </h2>
          </div>

          {/* Answer Toggle Section */}
          {showAnswer ? (
            <div className="bg-emerald-50/70 border-2 border-brand-green rounded-2xl p-5 shadow-brutal-sm flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-brand-green font-black text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" /> Verified Answer & Invariant
              </div>
              <p className="text-sm font-medium text-brand-dark whitespace-pre-line leading-relaxed">
                {activeCard.answer}
              </p>
            </div>
          ) : (
            <div
              onClick={() => setShowAnswer(true)}
              className="py-12 bg-cream-50 border-2 border-dashed border-brand-dark/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-cream-100 transition-colors select-none"
            >
              <Eye className="w-8 h-8 text-brand-dark/60 mb-2" />
              <span className="text-sm font-black text-brand-dark">Click to Reveal Answer</span>
              <span className="text-xs text-brand-dark/60">Test yourself before flipping!</span>
            </div>
          )}

          {/* SM-2 Recall Rating Buttons */}
          {showAnswer && (
            <div className="pt-4 border-t-2 border-cream-200 flex flex-col gap-3">
              <span className="text-xs font-black uppercase text-center text-brand-dark/60">
                How easily did you recall this concept?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleRate('again')}
                  className="bg-red-50 text-brand-red border-brand-red hover:bg-red-100"
                >
                  Again (1d)
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleRate('hard')}
                  className="bg-amber-50 text-amber-900 border-amber-600 hover:bg-amber-100"
                >
                  Hard (3d)
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleRate('good')}
                >
                  Good (7d)
                </Button>
                <Button
                  variant="green"
                  size="md"
                  onClick={() => handleRate('easy')}
                >
                  Easy (14d) 🚀
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* All Caught Up Celebration */
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-10 text-center shadow-brutal-lg flex flex-col items-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-dark mb-2">
            You're All Caught Up on Revisions!
          </h2>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 max-w-md mb-6">
            You've completed all scheduled SM-2 spaced repetition cards for today. Your memory traces are reinforced for exam day.
          </p>
          <Button variant="primary" size="md" onClick={() => window.location.reload()}>
            Refresh Revision Queue
          </Button>
        </div>
      )}
    </div>
  );
};
