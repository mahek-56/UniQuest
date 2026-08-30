import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGamification } from '../../context/GamificationContext';
import { useNotifications } from '../../context/NotificationContext';
import { LevelBadge, CoinCounter, StreakCard } from '../gamification/LevelBadge';

export const Topbar = ({ onToggleMobileMenu }) => {
  const { user } = useAuth();
  const { levelData, coins, streak } = useGamification();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-cream-50/90 backdrop-blur-md border-b-3 border-brand-dark px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile brand & toggle */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl border-2 border-brand-dark bg-white shadow-brutal-sm cursor-pointer"
        >
          <Menu className="w-5 h-5 text-brand-dark" />
        </button>
        <div onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-xl">🛡️</span>
          <span className="font-black text-lg text-brand-dark tracking-tight">
            Uni<span className="text-brand-pink">Quest</span>
          </span>
        </div>
      </div>

      {/* Global Search Input */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3.5 text-brand-dark/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects, algorithms, concepts..."
          className="w-full bg-white text-brand-dark font-medium text-xs sm:text-sm border-2 border-brand-dark rounded-xl pl-10 pr-4 py-2 shadow-brutal-sm placeholder:text-brand-dark/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </form>

      {/* Gamification Pills & User Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Pill */}
        <StreakCard streak={streak} compact />

        {/* Coins Pill */}
        <CoinCounter coins={coins} />

        {/* Level Badge */}
        <div className="hidden sm:inline-flex">
          <LevelBadge level={levelData.level} title={levelData.title} badge={levelData.badge} size="sm" />
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl border-2 border-brand-dark bg-white shadow-brutal-sm hover:bg-cream-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-brand-dark" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-[10px] font-black w-5 h-5 rounded-full border border-brand-dark flex items-center justify-center shadow-brutal-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div
          onClick={() => navigate('/profile')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-brand-dark bg-brand-gold overflow-hidden cursor-pointer shadow-brutal-sm hover:scale-105 transition-transform shrink-0"
          title="My Profile"
        >
          <img src={user?.avatar} alt={user?.name || "User"} className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};
