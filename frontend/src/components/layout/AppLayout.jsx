import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useGamification } from '../../context/GamificationContext';
import { CelebrationModal, XPFloatingToastContainer } from '../gamification/CelebrationModal';
import { X } from 'lucide-react';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { levelUpModal, closeLevelUpModal, floatingToasts, dismissToast } = useGamification();

  return (
    <div className="flex min-h-screen bg-cream-50 text-brand-dark antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-brand-dark/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-cream-100 border-r-3 border-brand-dark min-h-screen p-5 flex flex-col z-10 shadow-brutal-lg">
            <div className="flex items-center justify-between mb-6">
              <span className="font-black text-xl text-brand-dark">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl border border-brand-dark bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Sidebar content */}
            <div onClick={() => setMobileMenuOpen(false)}>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Topbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Celebratory Level-Up Modal */}
      <CelebrationModal
        levelUpData={levelUpModal}
        onClose={closeLevelUpModal}
      />

      {/* Global XP & Coins Floating Feedback Toasts */}
      <XPFloatingToastContainer
        toasts={floatingToasts}
        onDismiss={dismissToast}
      />
    </div>
  );
};
