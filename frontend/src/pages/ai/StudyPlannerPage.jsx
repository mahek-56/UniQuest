import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  BookOpen,
  Target,
  Zap,
  AlertCircle,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';

export const StudyPlannerPage = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultFutureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Mode: 'custom_range' | 'exam_prep'
  const [plannerMode, setPlannerMode] = useState('custom_range');

  // Mode 1: Custom Date Range fields
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [customGoals, setCustomGoals] = useState('Active problem solving, syllabus coverage, and daily revision');

  // Mode 2: Exam Prep fields
  const [examDate, setExamDate] = useState(defaultFutureDate);
  const [targetGrade, setTargetGrade] = useState('A+');
  const [preparationLevel, setPreparationLevel] = useState('Comprehensive Revision');
  const [weakFocus, setWeakFocus] = useState('Database Normalization & Deadlocks');

  // Shared
  const [dailyHours, setDailyHours] = useState(3);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setError(null);

    if (plannerMode === 'custom_range') {
      if (!startDate || !endDate) {
        setError('Please select both a valid start date and end date.');
        return;
      }
      if (endDate < startDate) {
        setError('End date must be on or after the start date.');
        return;
      }
    } else {
      if (examDate && examDate < todayStr) {
        setError('Exam target date cannot be in the past. Please select today or a future date.');
        return;
      }
    }

    setLoading(true);
    setPlan(null);
    try {
      const payload = plannerMode === 'custom_range'
        ? {
            mode: 'custom_range',
            startDate,
            endDate,
            dailyHours,
            goals: customGoals,
          }
        : {
            mode: 'exam_prep',
            examDate,
            dailyHours,
            targetGrade,
            preparationLevel,
            weakFocus,
          };

      const response = await aiApi.generateStudyPlan(payload);

      if (response && response.error) {
        setError(response.message || 'Failed to generate study plan.');
      } else if (response && response.plan_data) {
        setPlan(response.plan_data);
      } else {
        setPlan(response);
      }
    } catch (e) {
      console.error('Failed to generate plan:', e);
      setError('An unexpected error occurred while generating your study plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <CalendarDays className="w-4 h-4" /> AI Study Timetable Architect
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Personalized AI Study Timetable
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Generate active-recall schedules tailored for your daily availability, custom date ranges, or upcoming semester exams.
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
          {loading ? 'Synthesizing Schedule...' : 'Generate New AI Plan 🚀'}
        </Button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setPlannerMode('custom_range');
            setError(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 border-brand-dark cursor-pointer ${
            plannerMode === 'custom_range'
              ? 'bg-brand-blue text-white shadow-brutal scale-105'
              : 'bg-white text-brand-dark hover:bg-cream-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Custom Date Range Plan</span>
        </button>

        <button
          onClick={() => {
            setPlannerMode('exam_prep');
            setError(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 border-brand-dark cursor-pointer ${
            plannerMode === 'exam_prep'
              ? 'bg-brand-gold text-brand-dark shadow-brutal scale-105'
              : 'bg-white text-brand-dark hover:bg-cream-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>📝 Exam Preparation Plan</span>
        </button>
      </div>

      {/* Mode 1: Custom Date Range Form Box */}
      {plannerMode === 'custom_range' && (
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-cream-50 text-brand-dark font-bold text-xs border-2 border-brand-dark rounded-xl pl-10 pr-3 py-2.5 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
              End Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50" />
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-cream-50 text-brand-dark font-bold text-xs border-2 border-brand-dark rounded-xl pl-10 pr-3 py-2.5 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <Input
            label="Daily Study Hours"
            type="number"
            min="1"
            max="12"
            value={dailyHours}
            onChange={(e) => setDailyHours(e.target.value)}
            icon={Clock}
          />

          <Input
            label="Learning Goals & Focus"
            value={customGoals}
            onChange={(e) => setCustomGoals(e.target.value)}
            placeholder="e.g. Complete DBMS & OS chapters"
            icon={Target}
          />
        </div>
      )}

      {/* Mode 2: Exam Preparation Form Box */}
      {plannerMode === 'exam_prep' && (
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-1.5">
              Exam Target Date (≥ Today)
            </label>
            <div className="relative">
              <CalendarDays className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/50" />
              <input
                type="date"
                min={todayStr}
                value={examDate}
                onChange={(e) => {
                  setExamDate(e.target.value);
                  if (e.target.value >= todayStr) setError(null);
                }}
                className="w-full bg-cream-50 text-brand-dark font-bold text-xs border-2 border-brand-dark rounded-xl pl-10 pr-3 py-2.5 shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <Select
            label="Target Semester Grade"
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            options={[
              { value: 'A+', label: 'A+ (Top 1% Valedictorian)' },
              { value: 'A', label: "A (Top 5% Dean's List)" },
              { value: 'B+', label: 'B+ (Above Average)' },
            ]}
          />

          <Select
            label="Preparation Intensity"
            value={preparationLevel}
            onChange={(e) => setPreparationLevel(e.target.value)}
            options={[
              { value: 'Comprehensive Revision', label: 'Comprehensive Revision' },
              { value: 'Crash Course Mastery', label: 'High-Yield Crash Course' },
              { value: 'Past Papers Drill', label: 'Past Papers & Mock Focus' },
            ]}
          />

          <Input
            label="Daily Study Hours"
            type="number"
            min="1"
            max="12"
            value={dailyHours}
            onChange={(e) => setDailyHours(e.target.value)}
            icon={Clock}
          />

          <Input
            label="Weak Topics Priority"
            value={weakFocus}
            onChange={(e) => setWeakFocus(e.target.value)}
            placeholder="e.g. BCNF, Banker's Algorithm"
            icon={Target}
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border-2 border-brand-red rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-brand-red shadow-brutal-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Schedule Display */}
      {plan ? (
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-cream-100 border-2 border-brand-dark rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-brutal-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase bg-brand-dark text-white px-2.5 py-0.5 rounded-full">
                  {plannerMode === 'custom_range' ? 'Custom Date Range Plan' : 'Exam Preparation Plan'}
                </span>
                <span className="text-xs font-bold text-brand-dark/60">
                  {plan.days?.length || 0} Scheduled Days
                </span>
              </div>
              <h3 className="font-black text-base text-brand-dark">Schedule Strategy:</h3>
              <p className="text-xs font-medium text-brand-dark/75 mt-0.5">{plan.scheduleSummary}</p>
            </div>
            <span className="text-xs font-black bg-brand-gold px-3 py-1.5 rounded-xl border border-brand-dark shadow-brutal-sm shrink-0">
              {plan.weeklyGoalHours}h Total Goal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(plan.days || []).map((d, idx) => (
              <div
                key={d.date || idx}
                className="bg-white border-2 border-brand-dark rounded-3xl p-5 shadow-brutal flex flex-col justify-between"
                style={{ borderTop: `6px solid ${d.color || '#0055DA'}` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-black text-base sm:text-lg text-brand-dark">{d.dayName || `Day ${idx + 1}`}</h4>
                      {d.date && (
                        <span className="text-[10px] font-bold text-brand-dark/50 block">
                          📅 {d.date}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase bg-cream-100 border border-brand-dark px-2 py-0.5 rounded-full shrink-0">
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
            Select your desired mode above and click 'Generate New AI Plan' to create an optimized schedule.
          </p>
          <Button variant="primary" size="md" onClick={handleGenerate}>
            Generate Timetable Now
          </Button>
        </div>
      )}
    </div>
  );
};
