import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Target, Bot, User } from 'lucide-react';

export const MobileNav = () => {
  const items = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Quests', path: '/quests', icon: Target },
    { label: 'AI Tutor', path: '/ai-tutor', icon: Bot, isAi: true },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-3 border-brand-dark px-3 py-2 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl font-black text-[11px] transition-all ${
                isActive
                  ? 'text-brand-blue bg-cream-100 border border-brand-dark scale-105 shadow-brutal-sm'
                  : 'text-brand-dark/70 hover:text-brand-dark'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.isAi && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-pink animate-ping" />
              )}
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
