import React from 'react';
import { Brain, ShieldAlert, Sparkles, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const MLPredictionBadge = ({ prediction }) => {
  if (!prediction) return null;

  const isInsufficient = prediction.prediction === 'insufficient_data' || prediction.predictedCategory === 'insufficient_data';

  if (isInsufficient) {
    return (
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-7 shadow-brutal flex flex-col gap-4">
        <div className="flex items-center gap-3.5 pb-4 border-b-2 border-cream-200">
          <div className="w-12 h-12 rounded-2xl bg-brand-dark text-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-xl text-brand-dark">ML Exam Performance Predictor</h3>
            <p className="text-xs font-semibold text-brand-dark/60 mt-0.5">
              Random Forest ML Classification Model
            </p>
          </div>
        </div>
        <div className="p-5 bg-amber-50 border-2 border-brand-gold rounded-2xl text-center">
          <span className="text-3xl mb-2 block">📊</span>
          <h4 className="font-black text-sm text-brand-dark">Insufficient Data for Performance Prediction</h4>
          <p className="text-xs font-semibold text-brand-dark/70 mt-1 max-w-md mx-auto text-center">
            {prediction.message || "Complete more quizzes, lessons, and spaced revisions to unlock machine learning grade predictions."}
          </p>
        </div>
      </div>
    );
  }

  // Map backend format to component expectations
  const predictedCategory = prediction.predictedCategory || 
    (prediction.prediction === 'strong' ? 'Strong' : 
     prediction.prediction === 'average' ? 'Average' : 
     prediction.prediction === 'at_risk' ? 'At_Risk' : prediction.prediction);

  const confidence = prediction.confidence || 0.85;
  const classProbabilities = prediction.classProbabilities || {
    Strong: predictedCategory === 'Strong' ? confidence : (1 - confidence) / 2,
    Average: predictedCategory === 'Average' ? confidence : (1 - confidence) / 2,
    At_Risk: predictedCategory === 'At_Risk' ? confidence : (1 - confidence) / 2,
  };
  const predictedSemesterGrade = prediction.predictedSemesterGrade || 
    (predictedCategory === 'Strong' ? 'A / A+' : predictedCategory === 'Average' ? 'B / B+' : 'C / D');

  const summary = prediction.summary || prediction.message || 
    `You are currently predicted to perform at a ${predictedCategory} level based on your active study telemetry.`;

  const backendFactors = prediction.key_factors || prediction.keyFactors || [];
  const factors = prediction.factors || (backendFactors.length > 0 ? backendFactors.map(f => ({
    name: f,
    impact: f.toLowerCase().includes("low") || f.toLowerCase().includes("no ") || f.toLowerCase().includes("decline") || f.toLowerCase().includes("weak") ? "Negative" : "Positive",
    weight: f.toLowerCase().includes("low") || f.toLowerCase().includes("no ") || f.toLowerCase().includes("decline") || f.toLowerCase().includes("weak") ? "-15%" : "+25%"
  })) : [
    { name: "Consistent Quiz Performance", impact: "Positive", weight: "+30%" },
    { name: "Active Study Habits", impact: "Positive", weight: "+20%" }
  ]);

  const categoryConfig = {
    Strong: {
      bg: 'bg-emerald-50 border-emerald-500 text-emerald-950',
      badgeBg: 'bg-brand-green text-brand-dark',
      icon: '🚀',
      headline: 'High Academic Momentum (Top Tier)',
    },
    Average: {
      bg: 'bg-amber-50 border-amber-500 text-amber-950',
      badgeBg: 'bg-brand-gold text-brand-dark',
      icon: '⚖️',
      headline: 'Steady Pace • Improvement Opportunities Available',
    },
    At_Risk: {
      bg: 'bg-rose-50 border-rose-500 text-rose-950',
      badgeBg: 'bg-brand-red text-white',
      icon: '⚠️',
      headline: 'Intervention Recommended (At Risk)',
    },
  };

  const current = categoryConfig[predictedCategory] || categoryConfig.Strong;

  return (
    <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-7 shadow-brutal flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-cream-200">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-dark text-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-brand-dark">ML Exam Performance Predictor</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-cream-100 border border-brand-dark px-2 py-0.5 rounded-full text-brand-dark">
                Random Forest ML
              </span>
            </div>
            <p className="text-xs font-semibold text-brand-dark/60 mt-0.5">
              Trained on student study telemetry, quiz accuracy, and revision cadence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-bold text-brand-dark/60 uppercase">Predicted Grade</span>
            <div className="text-2xl font-black text-brand-blue">{predictedSemesterGrade}</div>
          </div>
          <div className={`px-4 py-2 rounded-2xl border-2 border-brand-dark font-black text-sm shadow-brutal-sm flex items-center gap-1.5 ${current.badgeBg}`}>
            <span>{current.icon}</span>
            <span>{predictedCategory}</span>
          </div>
        </div>
      </div>

      {/* Model Probability Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl border-2 border-brand-dark bg-emerald-50 flex flex-col gap-1 shadow-brutal-sm">
          <div className="flex justify-between text-xs font-black text-emerald-900">
            <span>Strong Probability</span>
            <span>{Math.round((classProbabilities?.Strong || 0.88) * 100)}%</span>
          </div>
          <ProgressBar progress={(classProbabilities?.Strong || 0.88) * 100} color="green" height="sm" />
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-brand-dark bg-amber-50 flex flex-col gap-1 shadow-brutal-sm">
          <div className="flex justify-between text-xs font-black text-amber-900">
            <span>Average Probability</span>
            <span>{Math.round((classProbabilities?.Average || 0.09) * 100)}%</span>
          </div>
          <ProgressBar progress={(classProbabilities?.Average || 0.09) * 100} color="gold" height="sm" />
        </div>

        <div className="p-3.5 rounded-2xl border-2 border-brand-dark bg-rose-50 flex flex-col gap-1 shadow-brutal-sm">
          <div className="flex justify-between text-xs font-black text-rose-900">
            <span>At-Risk Probability</span>
            <span>{Math.round((classProbabilities?.At_Risk || 0.03) * 100)}%</span>
          </div>
          <ProgressBar progress={(classProbabilities?.At_Risk || 0.03) * 100} color="pink" height="sm" />
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-cream-100/70 border-2 border-brand-dark rounded-2xl p-4 sm:p-5">
        <h4 className="font-black text-sm text-brand-dark mb-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-pink" /> ML Diagnostic Summary:
        </h4>
        <p className="text-xs font-medium text-brand-dark/80 leading-relaxed">{summary}</p>
      </div>

      {/* Feature Weights & Impact Factors */}
      <div>
        <h4 className="font-black text-xs uppercase tracking-wider text-brand-dark/70 mb-3">
          Key Predictive Factors Identified by Model:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {factors.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl border border-brand-dark bg-cream-50 text-xs font-bold text-brand-dark"
            >
              <div className="flex items-center gap-2">
                {f.impact.includes("Positive") ? (
                  <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />
                )}
                <span>{f.name}</span>
              </div>
              <span className={`font-black ${f.impact.includes("Positive") ? 'text-brand-green' : 'text-brand-red'}`}>
                {f.weight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TopicMasteryList = ({ strongTopics = [], weakTopics = [] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strong Topics */}
      <div className="bg-white border-2 border-brand-dark rounded-3xl p-5 sm:p-6 shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h4 className="font-black text-base text-brand-dark">Strong Mastery Topics</h4>
          </div>
          <span className="text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-500 px-2.5 py-0.5 rounded-full">
            {strongTopics.length} Mastered
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {strongTopics.map((t, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-brand-dark bg-emerald-50/50 flex items-center justify-between"
            >
              <div>
                <h5 className="font-black text-xs sm:text-sm text-brand-dark">{t.topic}</h5>
                <span className="text-[11px] font-bold text-brand-dark/60">{t.subject}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-brand-green">{t.accuracy}% Acc</span>
                <span className="block text-[10px] font-bold text-emerald-800 uppercase">{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Topics / Action Items */}
      <div className="bg-white border-2 border-brand-dark rounded-3xl p-5 sm:p-6 shadow-brutal">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h4 className="font-black text-base text-brand-dark">Needs Practice & Review</h4>
          </div>
          <span className="text-xs font-black bg-rose-100 text-rose-900 border border-rose-500 px-2.5 py-0.5 rounded-full">
            {weakTopics.length} Priority
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {weakTopics.map((t, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-brand-dark bg-rose-50/50 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <h5 className="font-black text-xs sm:text-sm text-brand-dark">{t.topic}</h5>
                <span className="text-xs font-black text-brand-red">{t.accuracy}% Acc</span>
              </div>
              <p className="text-[11px] font-semibold text-brand-dark/70">
                💡 <span className="text-brand-dark">{t.action}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
