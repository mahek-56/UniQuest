import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/landing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { OnboardingFlow } from '../pages/onboarding/OnboardingFlow';

// Protected App Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CoursesListPage } from '../pages/courses/CoursesListPage';
import { CourseDetailPage } from '../pages/courses/CourseDetailPage';
import { LessonPage } from '../pages/courses/LessonPage';
import { QuizTakePage } from '../pages/quizzes/QuizTakePage';
import { QuizResultPage } from '../pages/quizzes/QuizResultPage';
import { QuestsPage } from '../pages/quests/QuestsPage';
import { AchievementsPage } from '../pages/achievements/AchievementsPage';
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage';
import { RevisionPage } from '../pages/revision/RevisionPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { AiTutorPage } from '../pages/ai/AiTutorPage';
import { StudyPlannerPage } from '../pages/ai/StudyPlannerPage';
import { RecommendationsPage } from '../pages/ai/RecommendationsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Onboarding Flow */}
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/onboarding/*" element={<OnboardingFlow />} />

      {/* Protected App Routes under AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/courses" element={<CoursesListPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/lessons/:lessonId" element={<LessonPage />} />

          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
          <Route path="/quizzes/:quizId/result" element={<QuizResultPage />} />

          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/quests/:questId" element={<QuestsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />

          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/revision" element={<RevisionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          <Route path="/ai-tutor" element={<AiTutorPage />} />
          <Route path="/study-planner" element={<StudyPlannerPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
