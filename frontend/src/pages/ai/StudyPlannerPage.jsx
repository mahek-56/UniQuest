import React, { useState } from 'react';
import { CalendarDays, Sparkles, Clock, CheckCircle2, RefreshCw, BookOpen, Target, Zap } from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';

export const StudyPlannerPage = () => {
  const [dailyHours, setDailyHours] = useState(3);
  const [targetGrade, setTargetGrade] = useState("A+");
  const [examDate, setExamDate] = useState("2026-09-15");
  const [weakFocus, setWeakFocus] = useState("Database Normalization & Deadlocks");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const response = await aiApi.generateStudyPlan({
        dailyHours,
        targetGrade,
        examDate,
        weakFocus,
      });
      if (response && response.error) {
        setError(response.message || "Failed to generate study plan.");
      } else if (response && response.plan_data) {
        setPlan(response.plan_data);
      } else {
        setPlan(response);
      }
    } catch (e) {
      console.error("Failed to generate plan:", e);
      setError("An unexpected error occurred while generating your study plan. Please verify the backend service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <CalendarDays className="w-4 h-4" /> AI Study Timetable Architect
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Personalized AI Study Schedule
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Input your available hours and target subjects to generate an active-recall, quest-aligned weekly study schedule.
          </p>
        </div>

        <Button
          variant="pink"
          size="lg"
          onClick={handleGenerate}
          disabled={loading}
          icon={Sparkles}
          className="font-black shrink-0"
        >
          {loading ? 'Generating Schedule...' : 'Generate New AI Plan 🚀'}
        </Button>
      </div>

      {/* Configuration Parameters Box */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Available Study Hours/Day"
          type="number"
          min="1"
          max="12"
          value={dailyHours}
          onChange={(e) => setDailyHours(e.target.value)}
          icon={Clock}
        />

        <Select
          label="Target Semester Grade"
          value={targetGrade}
          onChange={(e) => setTargetGrade(e.target.value)}
          options={[
            { value: "A+", label: "A+ (Top 1% Valedictorian)" },
            { value: "A", label: "A (Top 5% Dean's List)" },
            { value: "B+", label: "B+ (Above Average)" },
          ]}
        />

        <Input
          label="Midterm Exam Target Date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          icon={CalendarDays}
        />

        <Input
          label="Weak Topics Priority"
          value={weakFocus}
          onChange={(e) => setWeakFocus(e.target.value)}
          placeholder="e.g. BCNF, Dijkstra"
          icon={Target}
        />
      </div>

      {error && (
        <div className="p-5 bg-rose-50 border-2 border-brand-red rounded-2xl text-center text-xs font-bold text-brand-red shadow-brutal-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Generated Schedule Display */}
      {plan ? (
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-cream-100 border-2 border-brand-dark rounded-2xl flex items-center justify-between shadow-brutal-sm">
            <div>
              <h3 className="font-black text-base text-brand-dark">Schedule Overview:</h3>
              <p className="text-xs font-medium text-brand-dark/75 mt-0.5">{plan.scheduleSummary}</p>
            </div>
            <span className="text-xs font-black bg-brand-gold px-3 py-1.5 rounded-xl border border-brand-dark shadow-brutal-sm">
              {plan.weeklyGoalHours}h Weekly Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(plan.days || []).map((d, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-brand-dark rounded-3xl p-5 shadow-brutal flex flex-col justify-between"
                style={{ borderTop: `6px solid ${d.color || '#0055DA'}` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-lg text-brand-dark">{d.dayName || `Day ${idx + 1}`}</h4>
                    <span className="text-[10px] font-black uppercase bg-cream-100 border border-brand-dark px-2 py-0.5 rounded-full">
                      {d.focusSubject || 'Focus'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-brand-blue mb-4">{d.theme || 'Study Session'}</p>

                  <div className="flex flex-col gap-2.5">
                    {(d.blocks || []).map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-3 rounded-xl border border-brand-dark bg-cream-50 flex items-center justify-between text-xs font-bold"
                      >
                        <div>
                          <span className="block text-[10px] text-brand-dark/60 font-black">{b.time}</span>
                          <span className="text-brand-dark">{b.task}</span>
                        </div>
                        <span className="text-[11px] font-black text-brand-pink shrink-0 ml-2">
                          +{b.xp || 30} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-cream-100 border-2 border-dashed border-brand-dark/30 rounded-3xl">
          <span className="text-5xl">📅</span>
          <h3 className="text-xl font-black text-brand-dark mt-3">No Active Study Plan</h3>
          <p className="text-xs font-medium text-brand-dark/60 mt-1 mb-4">
            Click 'Generate New AI Plan' above to create an optimized timetable.
          </p>
          <Button variant="primary" size="md" onClick={handleGenerate}>
            Generate Timetable Now
          </Button>
        </div>
      )}
    </div>
  );
};
