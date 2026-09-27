import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Brain,
  Zap,
  Target,
  Sparkles,
  Users,
  Layers,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { analyticsApi } from '../../services/analyticsApi';
import { MLPredictionBadge, TopicMasteryList } from '../../components/analytics/MLPredictionBadge';
import { UserComparisonModal } from '../../components/analytics/UserComparisonModal';
import { Button } from '../../components/common/Button';

export const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [studyTimeBySubject, setStudyTimeBySubject] = useState([]);
  const [subjectMasteryRadar, setSubjectMasteryRadar] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [strongTopics, setStrongTopics] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(false);

        const [overviewRes, progressRes, subjectsRes, weakTopicsRes, studyTimeRes, mlRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getProgress(),
          analyticsApi.getSubjects(),
          analyticsApi.getWeakTopics(),
          analyticsApi.getStudyTime(),
          analyticsApi.getMLPrediction()
        ]);

        const totalStudyMins = overviewRes.total_study_time_minutes || overviewRes.totalStudyTimeMinutes || 0;
        const avgQuizScore = overviewRes.avg_quiz_score || overviewRes.avgQuizScore || 0;
        const lessonsCompleted = overviewRes.total_lessons_completed || overviewRes.lessonsCompleted || 0;
        const activeStreakDays = overviewRes.current_streak || overviewRes.currentStreak || overviewRes.activeStreakDays || 0;

        setOverview({
          totalStudyHours: (totalStudyMins / 60).toFixed(1),
          averageQuizAccuracy: Math.round(avgQuizScore),
          lessonsCompleted: lessonsCompleted,
          activeStreakDays: activeStreakDays,
        });

        // studyTimeBySubject
        const mappedStudyTime = (studyTimeRes || []).map(item => {
          const d = new Date(item.date);
          const dayFormatted = `${d.getMonth() + 1}/${d.getDate()}`;
          return {
            name: dayFormatted,
            hours: Number((item.minutes / 60).toFixed(1))
          };
        });
        setStudyTimeBySubject(mappedStudyTime);

        // subjectMasteryRadar
        const safeSubjects = Array.isArray(subjectsRes) ? subjectsRes : [];
        setSubjectsList(safeSubjects);

        const mappedRadar = safeSubjects.map(item => ({
          subject: item.subject || "Subject",
          score: Math.round(item.avg_score || 0),
          fullMark: 100
        }));
        setSubjectMasteryRadar(mappedRadar.length > 0 ? mappedRadar : [
          { subject: "DBMS", score: 85, fullMark: 100 },
          { subject: "Operating Systems", score: 70, fullMark: 100 },
          { subject: "DSA", score: 90, fullMark: 100 },
          { subject: "Networks", score: 75, fullMark: 100 },
          { subject: "AI/ML", score: 80, fullMark: 100 },
        ]);

        // strongTopics
        const mappedStrong = safeSubjects
          .filter(item => item.avg_score >= 70)
          .sort((a, b) => b.avg_score - a.avg_score)
          .slice(0, 3)
          .map(item => ({
            topic: `Core Mastery: ${item.subject}`,
            subject: item.subject,
            accuracy: Math.round(item.avg_score || 0),
            status: item.avg_score >= 85 ? "Mastered" : "Strong"
          }));
        setStrongTopics(mappedStrong.length > 0 ? mappedStrong : [
          { topic: "Relational Algebra & Normalization", subject: "DBMS", accuracy: 88, status: "Mastered" },
          { topic: "Process Synchronization & Semaphores", subject: "Operating Systems", accuracy: 80, status: "Strong" },
        ]);

        // weakTopics
        const mappedWeak = (weakTopicsRes || []).map(item => ({
          topic: item.topic,
          subject: item.subject,
          accuracy: Math.round((item.performance_score || 0) * 100),
          status: "Needs Practice",
          action: `Review core invariant proofs and complete spaced revision on ${item.subject}`
        }));
        setWeakTopics(mappedWeak.length > 0 ? mappedWeak : [
          { topic: "3NF vs BCNF Dependencies", subject: "DBMS", accuracy: 52, status: "Needs Practice", action: "Review dependency preservation rules" },
          { topic: "Banker's Algorithm Safety State", subject: "Operating Systems", accuracy: 48, status: "Needs Practice", action: "Practice resource allocation graphs" },
        ]);

        setMlPrediction(mlRes);

      } catch (e) {
        console.error("Error loading analytics:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 bg-white border-2 border-brand-dark rounded-3xl shadow-brutal max-w-xl mx-auto my-10 p-8">
        <div className="animate-spin text-4xl mb-3">📊</div>
        <p className="font-bold text-brand-dark text-base">Crunching Learning Telemetry & ML Predictions...</p>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="text-center py-20 bg-white border-2 border-brand-dark rounded-3xl shadow-brutal max-w-xl mx-auto my-10 p-6">
        <div className="text-5xl mb-3">⚠️</div>
        <p className="font-bold text-brand-red text-lg">Failed to load analytics</p>
        <p className="text-xs font-semibold text-brand-dark/70 mt-1">Please ensure the backend server is running and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <BarChart3 className="w-4 h-4" /> Academic Telemetry & Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Learning Performance & ML Insights
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1 max-w-xl">
            Detailed breakdown of your study hours, quiz accuracy curves, topic mastery, and ML exam outcome predictions.
          </p>
        </div>

        <Button
          variant="pink"
          size="md"
          onClick={() => setComparisonModalOpen(true)}
          icon={Users}
          className="font-black shrink-0"
        >
          Compare with Classmates 👥
        </Button>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Study Hours", val: `${overview.totalStudyHours}h`, icon: Clock, color: "bg-brand-blue text-white" },
          { label: "Quiz Accuracy", val: `${overview.averageQuizAccuracy}%`, icon: CheckCircle2, color: "bg-brand-green text-brand-dark" },
          { label: "Lessons Done", val: `${overview.lessonsCompleted}`, icon: Target, color: "bg-brand-gold text-brand-dark" },
          { label: "Active Streak", val: `${overview.activeStreakDays} Days`, icon: Zap, color: "bg-brand-pink text-white" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border-2 border-brand-dark rounded-2xl p-5 shadow-brutal flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl border-2 border-brand-dark flex items-center justify-center text-xl shadow-brutal-sm ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand-dark/60 uppercase">{stat.label}</span>
                <h3 className="text-2xl font-black text-brand-dark">{stat.val}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* ML Exam Outcome Predictor */}
      <MLPredictionBadge prediction={mlPrediction} />

      {/* Subject Performance Breakdown Table */}
      {subjectsList.length > 0 && (
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-brand-dark flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-blue" /> Subject Academic Standing
            </h3>
            <span className="text-xs font-bold text-brand-dark/60">
              {subjectsList.length} Subjects Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-cream-200 text-brand-dark/60 uppercase font-black">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-center">Quizzes Taken</th>
                  <th className="py-2.5 px-3 text-center">Average Score</th>
                  <th className="py-2.5 px-3 text-center">Best Score</th>
                  <th className="py-2.5 px-3 text-right">Academic Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 font-bold text-brand-dark">
                {subjectsList.map((s, idx) => {
                  const avg = Math.round(s.avg_score || 0);
                  const isStrong = avg >= 75;
                  return (
                    <tr key={idx} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 px-3 font-black text-sm">{s.subject}</td>
                      <td className="py-3 px-3 text-center">{s.quizzes_taken}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={isStrong ? 'text-brand-green font-black' : 'text-brand-red font-black'}>
                          {avg}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">{Math.round(s.best_score || 0)}%</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          isStrong ? 'bg-emerald-100 text-emerald-900 border-emerald-500' : 'bg-amber-100 text-amber-900 border-amber-500'
                        }`}>
                          {isStrong ? 'Strong' : 'Review Needed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Mastery Radar Chart */}
        <div className="bg-white border-2 border-brand-dark rounded-3xl p-6 shadow-brutal">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-base text-brand-dark">Curriculum Subject Mastery</h3>
            <span className="text-xs font-bold text-brand-dark/60">Radar Evaluation</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subjectMasteryRadar}>
                <PolarGrid stroke="#36064D" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#36064D" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Mastery" dataKey="score" stroke="#0055DA" fill="#0055DA" fillOpacity={0.45} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time by Subject BarChart */}
        <div className="bg-white border-2 border-brand-dark rounded-3xl p-6 shadow-brutal">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-base text-brand-dark">Study Hours by Day</h3>
            <span className="text-xs font-bold text-brand-dark/60">Total {overview.totalStudyHours}h</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyTimeBySubject}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#36064D" />
                <YAxis stroke="#36064D" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #36064D',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="hours" fill="#FF0052" stroke="#36064D" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strong & Weak Topics Breakdown */}
      <TopicMasteryList strongTopics={strongTopics} weakTopics={weakTopics} />

      {/* Peer Comparison Modal */}
      <UserComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
      />
    </div>
  );
};
