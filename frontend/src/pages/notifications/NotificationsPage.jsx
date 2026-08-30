import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Flame, RotateCcw, Target, Trophy } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';

export const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, loading, error } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'streak': return '🔥';
      case 'revision': return '🧠';
      case 'quest': return '🎯';
      case 'leaderboard': return '🏆';
      default: return '🔔';
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-6 sm:p-8 shadow-brutal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-dark font-black text-xs uppercase px-3 py-1 rounded-full border border-brand-dark shadow-brutal-sm mb-3">
            <Bell className="w-4 h-4" /> Live Alerts
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm font-medium text-brand-dark/70 mt-1">
            Stay updated on quest completions, streak reminders, and spaced revisions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          icon={CheckCheck}
        >
          Mark All Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border-3 border-brand-dark rounded-3xl p-4 sm:p-6 shadow-brutal flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-12 text-xs font-bold text-brand-dark/50 animate-pulse">
            Loading alerts...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-xs font-bold text-brand-red">
            Failed to load notifications. Please check backend connection.
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-4 rounded-2xl border-2 border-brand-dark cursor-pointer transition-all duration-150 flex items-start gap-4 ${
                notif.read ? 'bg-cream-50/50 opacity-70 hover:opacity-100' : 'bg-white shadow-brutal-sm hover:bg-cream-100'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-cream-100 border border-brand-dark flex items-center justify-center text-xl shrink-0 shadow-brutal-sm">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-brand-dark">{notif.title}</h4>
                  <span className="text-[11px] font-bold text-brand-dark/50 shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-xs font-medium text-brand-dark/80 mt-0.5">{notif.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-xs font-bold text-brand-dark/60">
            No notifications at the moment.
          </div>
        )}
      </div>
    </div>
  );
};
