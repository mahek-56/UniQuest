import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Flame,
  Trophy,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Bot,
  CheckCircle2,
  TrendingUp,
  Target,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { courseApi } from '../../services/courseApi';
import { revisionApi } from '../../services/revisionApi';
import { aiApi } from '../../services/aiApi';
import { analyticsApi } from '../../services/analyticsApi';
import { XPCard } from '../../components/gamification/XPCard';
import { QuestCard } from '../../components/gamification/QuestCard';
import { CourseCard } from '../../components/learning/CourseCard';
import { Button } from '../../components/common/Button';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { levelData, streak, coins, quests, claimQuest } = useGamification();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [dueRevisions, setDueRevisions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const cData = await courseApi.getCourses();
        setCourses(cData);

        const rData = await revisionApi.getDue();
        setDueRevisions(rData.filter(r => r.dueToday));

        const aiRecs = await aiApi.getRecommendations();
        setRecommendations(aiRecs);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      }

      try {
        setChartLoading(true);
        setChartError(false);
        const progressData = await analyticsApi.getProgress();
        
        const sortedData = [...progressData].sort((a, b) => new Date(a.date) - new Date(b.date));
        const mapped = sortedData.map(item => {
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          return {
            day: dayName,
            xp: item.xp_earned !== undefined ? item.xp_earned : (item.xpEarned || 0)
          };
        });
        setWeeklyChartData(mapped);
      } catch (e) {
        console.error("Error loading progress analytics:", e);
        setChartError(true);
      } finally {
        setChartLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const totalWeeklyXP = weeklyChartData.reduce((sum, item) => sum + item.xp, 0);

  const inProgressCourses = courses.filter(c => c.progress > 0).slice(0, 2);
  const todayQuests = quests.slice(0, 3);
  const topRec = recommendations[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal overflow-hidden">
        {/* Background decorative stickers */}
        <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-brand-gold/25 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
              <span>🔥</span>
              <span>{streak}-Day Active Streak</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight">
              Greetings, {user?.name || "Scholar"}! 🚀
            </h1>
            <p className="text-xs sm:text-sm font-medium text-brand-dark/75 mt-1 max-w-xl">
              You are {levelData?.remainingXP} XP away from Level {levelData?.level + 1}. Complete today's quests and clear your spaced repetition queue to maintain your ranking!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="pink"
              size="md"
              onClick={() => navigate('/ai-tutor')}
              icon={Bot}
            >
              Ask AI Tutor
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/revision')}
              icon={RotateCcw}
            >
              Start Revision ({dueRevisions.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Gamification & Progress Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main XP Progression Card */}
        <div className="lg:col-span-2">
          <XPCard levelData={levelData} />
        </div>

        {/* Spaced Repetition Due Card */}
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider bg-cream-100 border border-brand-dark px-2.5 py-0.5 rounded-full text-brand-dark">
                Spaced Repetition
              </span>
              <span className="text-2xl animate-pulse">🧠</span>
            </div>
            <h3 className="font-black text-lg sm:text-xl text-brand-dark mb-1">
              {dueRevisions.length > 0
                ? `${dueRevisions.length} Topics Due for Review`
                : "All Caught Up! 🎉"}
            </h3>
            <p className="text-xs font-medium text-brand-dark/70">
              {dueRevisions.length > 0
                ? "Reviewing before memory decays ensures guaranteed exam retention."
                : "Great job! Your memory retention score is at peak level."}
            </p>
          </div>

          <div className="pt-4 border-t border-cream-200 mt-4">
            <Button
              variant={dueRevisions.length > 0 ? "gold" : "outline"}
              size="sm"
              className="w-full font-black"
              onClick={() => navigate('/revision')}
              icon={RotateCcw}
            >
              {dueRevisions.length > 0 ? "Review Cards Now (+15 XP)" : "Open Revision Vault"}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Smart Recommendation Spotlight */}
      {topRec && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-3 border-brand-blue rounded-3xl p-6 sm:p-7 shadow-brutal relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white border-2 border-brand-dark flex items-center justify-center text-2xl shrink-0 shadow-brutal-sm">
                💡
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase bg-brand-blue text-white px-2 py-0.5 rounded-full">
                    {topRec.badge}
                  </span>
                  <span className="text-xs font-bold text-brand-dark/60">{topRec.subject}</span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-brand-dark">{topRec.title}</h3>
                <p className="text-xs font-medium text-brand-dark/80 mt-1 max-w-2xl">{topRec.reason}</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="shrink-0 font-black"
              onClick={() => navigate(topRec.actionUrl)}
              icon={ArrowRight}
            >
              {topRec.actionLabel}
            </Button>
          </div>
        </div>
      )}

      {/* Today's Quests & Weekly Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Quests Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="font-black text-xl text-brand-dark">Today's Quests</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/quests')}
            >
              View All Quests
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {todayQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} onClaim={claimQuest} />
            ))}
          </div>
        </div>

        {/* Weekly Activity Recharts Chart */}
        <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 shadow-brutal flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-base text-brand-dark">Weekly XP Velocity</h3>
              <span className="text-xs font-black text-brand-pink flex items-center gap-0.5">
                <Zap className="w-3.5 h-3.5 fill-brand-pink" /> {totalWeeklyXP.toLocaleString()} Total
              </span>
            </div>
            <p className="text-xs font-medium text-brand-dark/60 mb-4">
              Your daily XP accumulation over the last 7 days
            </p>

            <div className="h-40 w-full flex items-center justify-center">
              {chartLoading ? (
                <div className="text-xs font-bold text-brand-dark/50 animate-pulse">Loading XP progress...</div>
              ) : chartError ? (
                <div className="text-xs font-bold text-brand-red">Failed to load XP history</div>
              ) : weeklyChartData.length === 0 ? (
                <div className="text-xs font-bold text-brand-dark/50 text-center px-4">
                  No activity recorded yet. Start learning to see your progress! 🚀
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#36064D" />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #36064D',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="xp" fill="#FFD400" radius={[6, 6, 0, 0]} stroke="#36064D" strokeWidth={1.5} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs font-bold text-brand-dark/70">
            <span>Daily Goal: 100 XP</span>
            <span className="text-brand-green font-black">Goal Met 5/7 Days</span>
          </div>
        </div>
      </div>

      {/* Continue Learning Courses Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h2 className="font-black text-xl text-brand-dark">Continue Your Courses</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>
            Browse Catalog
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inProgressCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};
