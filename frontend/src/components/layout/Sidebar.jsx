import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  RotateCcw,
  Trophy,
  BarChart3,
  Bot,
  CalendarDays,
  Sparkles,
  User,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const { levelData, streak } = useGamification();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Quests', path: '/quests', icon: Target, badge: 'Daily' },
    { label: 'Smart Revision', path: '/revision', icon: RotateCcw, badge: 'SM-2' },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, badge: 'ML' },
    { label: 'AI Tutor', path: '/ai-tutor', icon: Bot, isAi: true },
    { label: 'Study Planner', path: '/study-planner', icon: CalendarDays },
    { label: 'AI Recommend', path: '/recommendations', icon: Sparkles },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-cream-100 border-r-3 border-brand-dark min-h-screen p-5 shrink-0 select-none">
      {/* Brand Logo Header */}
      <div
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 mb-8 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-2xl bg-brand-gold border-2 border-brand-dark flex items-center justify-center text-2xl shadow-brutal transition-transform group-hover:scale-105 group-hover:rotate-2">
          🛡️
        </div>
        <div>
          <h1 className="font-black text-2xl tracking-tight text-brand-dark flex items-center gap-1 leading-none">
            Uni<span className="text-brand-pink">Quest</span>
          </h1>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-blue mt-1">
            Turn Learning Into a Quest
          </p>
        </div>
      </div>

      {/* User Quick Status Pill */}
      {user && (
        <div className="bg-white border-2 border-brand-dark rounded-2xl p-3 shadow-brutal-sm mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-brand-dark bg-cream-200 overflow-hidden shrink-0">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-black text-xs truncate text-brand-dark">{user.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black text-brand-blue">
                Lvl {levelData?.level} {levelData?.title}
              </span>
              <span className="text-[10px] font-black text-brand-pink flex items-center gap-0.5">
                🔥 {streak}d
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black text-sm border-2 transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-dark shadow-brutal-sm'
                    : 'bg-transparent text-brand-dark border-transparent hover:bg-white hover:border-brand-dark/30'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-gold text-brand-dark border border-brand-dark uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
              {item.isAi && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-pink text-white border border-brand-dark uppercase tracking-wider animate-pulse">
                  AI
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="pt-4 border-t-2 border-brand-dark/20 mt-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-brand-red hover:bg-rose-50 border-2 border-transparent hover:border-brand-red transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
