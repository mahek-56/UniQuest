import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Target, Brain, Flame } from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { Button } from '../../components/common/Button';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecs = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await aiApi.getRecommendations();
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Failed to load recommendations:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadRecs();
  }, []);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <Sparkles className="w-4 h-4" /> Personalized AI Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            AI Smart Recommendations
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Dynamic learning actions prioritized by our AI based on your recent quiz errors, revision schedules, and mastery gaps.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20 bg-white border-3 border-brand-dark rounded-3xl shadow-brutal">
          <div className="animate-spin text-4xl mb-3">🪄</div>
          <p className="font-bold text-brand-dark">Asking AI for recommendation stream...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-16 bg-white border-3 border-brand-dark rounded-3xl shadow-brutal p-6 max-w-xl mx-auto my-6">
          <span className="text-4xl mb-2 block">⚠️</span>
          <h4 className="font-black text-brand-red text-lg">Error Loading Recommendations</h4>
          <p className="text-xs font-semibold text-brand-dark/70 mt-1">Could not fetch recommendations from the AI engine. Please ensure the backend is running.</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="text-center py-16 bg-cream-100 border-2 border-dashed border-brand-dark/30 rounded-3xl shadow-brutal">
          <span className="text-5xl block mb-2">✨</span>
          <h3 className="text-xl font-black text-brand-dark">All Caught Up!</h3>
          <p className="text-xs font-medium text-brand-dark/60 mt-1">
            Our AI engine has no new recommendations for you. Complete more lessons or quizzes to unlock personalized paths!
          </p>
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="flex flex-col gap-4">
        {!loading && !error && recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white border-2 border-brand-dark rounded-3xl p-6 shadow-brutal hover:-translate-y-1 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-3xl shadow-brutal-sm shrink-0">
                {rec.type === 'weak_topic_boost' ? '🎯' : rec.type === 'spaced_repetition' ? '🧠' : '⚡'}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase bg-brand-dark text-white px-2.5 py-0.5 rounded-full">
                    {rec.badge}
                  </span>
                  <span className="text-xs font-bold text-brand-dark/60">{rec.subject}</span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-brand-dark">{rec.title}</h3>
                <p className="text-xs font-medium text-brand-dark/75 mt-1 max-w-xl">{rec.reason}</p>

                <div className="flex items-center gap-4 mt-3 text-xs font-bold text-brand-dark/70">
                  <span>⏱️ {rec.duration}</span>
                  <span className="text-brand-pink font-black flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-brand-pink" /> +{rec.xpPotential} XP
                  </span>
                  <span className="bg-cream-100 px-2 py-0.5 rounded-md border border-brand-dark/30">
                    {rec.difficulty}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="shrink-0 font-black"
              onClick={() => navigate(rec.actionUrl)}
              icon={ArrowRight}
            >
              {rec.actionLabel}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
